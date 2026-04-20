"use server";

import connectToDatabase from "@/lib/db";
import Customer from "@/lib/models/Customer";
import Product from "@/lib/models/Product";
import { auth } from "@/lib/auth";

export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();
  
  const customerFilter = session.user.role === 'admin' ? {} : {
    region: session.user.region,
    branch: session.user.branch
  };

  const totalCustomers = await Customer.countDocuments(customerFilter);
  
  let productFilter: any = {};
  if (session.user.role !== 'admin') {
    const customers = await Customer.find(customerFilter).select('_id');
    productFilter.customerId = { $in: customers.map((c) => c._id) };
  }

  const totalProducts = await Product.countDocuments(productFilter);

  const aggregationPipeline = [
    { $match: productFilter },
    {
      $facet: {
        byType: [
          { $group: { _id: "$type", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        byBatteryType: [
          { $match: { batteryType: { $exists: true, $ne: "" } } },
          { $group: { _id: "$batteryType", count: { $sum: 1 } } }
        ],
        byStatus: [
          {
            $addFields: {
              status: {
                $cond: [
                  { 
                    $and: [
                      { $ne: ["$installationDate", null] },
                      { $ne: ["$warrantyPeriod", null] },
                      { $lte: [new Date(), { $dateAdd: { startDate: "$installationDate", unit: "month", amount: "$warrantyPeriod" } }] }
                    ]
                  },
                  "Warranty",
                  {
                    $cond: [
                      {
                        $and: [
                          { $ne: ["$amcStartDate", null] },
                          { $ne: ["$amcPeriod", null] },
                          { $gte: [new Date(), "$amcStartDate"] },
                          { $lte: [new Date(), { $dateAdd: { startDate: "$amcStartDate", unit: "month", amount: "$amcPeriod" } }] }
                        ]
                      },
                      "AMC",
                      "Expired"
                    ]
                  }
                ]
              }
            }
          },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]
      }
    }
  ] as any[];

  const results = await Product.aggregate(aggregationPipeline);

  return JSON.parse(JSON.stringify({
    totalCustomers,
    totalProducts,
    productsByType: results[0]?.byType || [],
    productsByBattery: results[0]?.byBatteryType || [],
    productsByStatus: results[0]?.byStatus || []
  }));
}
