"use server";

import connectToDatabase from "@/lib/db";
import Product from "@/lib/models/Product";
import { auth } from "@/lib/auth";

export async function getDueVisits(page = 1, limit = 15, queryStr?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();

  const matchInitial: any = {
    visitFrequency: { $ne: null },
    amcStartDate: { $exists: true },
    amcPeriod: { $gt: 0 }
  };

  const pipeline: any[] = [
    { $match: matchInitial },
    {
      $addFields: {
        freqMonths: {
          $switch: {
            branches: [
              { case: { $eq: ["$visitFrequency", "monthly"] }, then: 1 },
              { case: { $eq: ["$visitFrequency", "quarterly"] }, then: 3 },
              { case: { $eq: ["$visitFrequency", "half-yearly"] }, then: 6 },
              { case: { $eq: ["$visitFrequency", "yearly"] }, then: 12 },
            ],
            default: 0
          }
        }
      }
    },
    {
      $addFields: {
        monthsSinceStart: {
          $dateDiff: {
            startDate: "$amcStartDate",
            endDate: new Date(),
            unit: "month"
          }
        }
      }
    },
    {
      $addFields: {
        currentIntervalIdx: {
          $floor: { $divide: ["$monthsSinceStart", "$freqMonths"] }
        }
      }
    },
    {
      $addFields: {
        intervalStart: {
          $dateAdd: {
            startDate: "$amcStartDate",
            unit: "month",
            amount: { $multiply: ["$currentIntervalIdx", "$freqMonths"] }
          }
        },
        intervalEnd: {
          $dateAdd: {
            startDate: "$amcStartDate",
            unit: "month",
            amount: { $multiply: [{ $add: ["$currentIntervalIdx", 1] }, "$freqMonths"] }
          }
        }
      }
    },
    {
      $addFields: {
        daysToEnd: {
          $dateDiff: {
            startDate: new Date(),
            endDate: "$intervalEnd",
            unit: "day"
          }
        }
      }
    },
    {
      $match: {
        monthsSinceStart: { $lt: "$amcPeriod" } // Enforce AMC is not fully expired
      }
    },
    {
      $lookup: {
        from: "visitlogs",
        let: { pId: "$_id", iStart: "$intervalStart", iEnd: "$intervalEnd" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ["$$pId", "$productIds"] },
                  { $gte: ["$visitDate", "$$iStart"] },
                  { $lte: ["$visitDate", "$$iEnd"] }
                ]
              }
            }
          }
        ],
        as: "logsInInterval"
      }
    },
    {
      $match: {
        "logsInInterval.0": { $exists: false }
      }
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer"
      }
    },
    {
      $unwind: "$customer"
    }
  ];

  if (session.user.role !== "admin") {
    pipeline.push({
      $match: {
        "customer.region": session.user.region,
        "customer.branch": session.user.branch
      } as any
    });
  }

  if (queryStr) {
    pipeline.push({
      $match: {
        $or: [
          { type: { $regex: queryStr, $options: "i" } },
          { serialNo: { $regex: queryStr, $options: "i" } },
          { "customer.organization": { $regex: queryStr, $options: "i" } },
          { "customer.customerName": { $regex: queryStr, $options: "i" } }
        ]
      }
    });
  }

  const skip = (page - 1) * limit;

  // Clone pipeline before sorting/skipping for accurate count
  const countPipeline = [...pipeline];
  countPipeline.push({ $count: "total" });

  pipeline.push({ $sort: { daysToEnd: 1 } });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });
  
  const results = await Product.aggregate(pipeline);
  const countResult = await Product.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  return {
    dueVisits: JSON.parse(JSON.stringify(results)),
    total,
    pages: Math.ceil(total / limit)
  };
}
