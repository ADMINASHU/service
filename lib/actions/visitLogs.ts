"use server";

import connectToDatabase from "@/lib/db";
import VisitLog from "@/lib/models/VisitLog";
import Customer from "@/lib/models/Customer";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createVisitLog(data: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();

  const productIdsString = data.get("productIds") as string;
  let productIds = [];
  try {
    if (productIdsString) {
      productIds = JSON.parse(productIdsString);
    }
  } catch (e) {
    console.error("Failed to parse productIds", e);
  }

  const visitDateStr = data.get("visitDate") as string;

  const visitData = {
    visitDate: visitDateStr ? new Date(visitDateStr) : new Date(),
    customerId: data.get("customerId") as string,
    productIds,
    complaintNo: data.get("complaintNo") as string | undefined,
    complaintType: data.get("complaintType") as string | undefined,
    complaintDate: data.get("complaintDate") ? new Date(data.get("complaintDate") as string) : undefined,
    complaintDescription: data.get("complaintDescription") as string | undefined,
    actionTaken: data.get("actionTaken") as string,
    visitedBy: data.get("visitedBy") as string,
    status: (data.get("status") as string) || "Closed",
    note: data.get("note") as string | undefined,
    createdBy: session.user.id,
  };

  await VisitLog.create(visitData);
  revalidatePath("/logbook");
  revalidatePath("/amc-tracker");
  return { success: true };
}

export async function getVisitLogs(page = 1, limit = 15, filters: any = {}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();
  
  let baseMatch: any = {};
  if (session.user.role !== 'admin') {
    const customers = await Customer.find({
      region: session.user.region,
      branch: session.user.branch
    }).select('_id');
    baseMatch.customerId = { $in: customers.map((c: any) => c._id) };
  }

  if (filters.q) {
    baseMatch.$or = [
      { actionTaken: { $regex: filters.q, $options: "i" } },
      { complaintNo: { $regex: filters.q, $options: "i" } },
      { visitedBy: { $regex: filters.q, $options: "i" } },
      { complaintType: { $regex: filters.q, $options: "i" } }
    ];
  }

  if (filters.status) {
    baseMatch.status = filters.status;
  }
  
  if (filters.visitedBy) {
    baseMatch.visitedBy = filters.visitedBy;
  }

  if (filters.month && filters.year) {
    const year = parseInt(filters.year);
    const month = parseInt(filters.month) - 1;
    const startObj = new Date(year, month, 1);
    const endObj = new Date(year, month + 1, 0, 23, 59, 59);
    baseMatch.visitDate = { $gte: startObj, $lte: endObj };
  } else if (filters.year) {
    const year = parseInt(filters.year);
    baseMatch.visitDate = { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59) };
  }

  const skip = (page - 1) * limit;
  const logs = await VisitLog.find(baseMatch)
    .populate({ path: 'customerId', select: 'customerName organization region branch' })
    .populate({ path: 'productIds', select: 'type serialNo' })
    .sort({ visitDate: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
  const total = await VisitLog.countDocuments(baseMatch);
  
  return {
    logs: JSON.parse(JSON.stringify(logs)),
    total,
    pages: Math.ceil(total / limit)
  };
}
