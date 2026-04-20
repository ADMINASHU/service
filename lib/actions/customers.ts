"use server";

import connectToDatabase from "@/lib/db";
import Customer from "@/lib/models/Customer";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getRoleBasedQuery() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  if (session.user.role === "admin") {
    return {};
  }
  
  return {
    region: session.user.region,
    branch: session.user.branch,
  };
}

export async function getCustomers(page = 1, limit = 15, queryStr?: string) {
  await connectToDatabase();
  const query: any = await getRoleBasedQuery();

  if (queryStr) {
    query.$or = [
      { customerName: { $regex: queryStr, $options: "i" } },
      { organization: { $regex: queryStr, $options: "i" } },
      { contactNo: { $regex: queryStr, $options: "i" } }
    ];
  }
  
  const skip = (page - 1) * limit;
  const customers = await Customer.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
  const total = await Customer.countDocuments(query);
  
  return {
    customers: JSON.parse(JSON.stringify(customers)),
    total,
    pages: Math.ceil(total / limit)
  };
}

export async function getCustomersList() {
  await connectToDatabase();
  const query = await getRoleBasedQuery();
  const customers = await Customer.find(query).select('customerName organization region branch').sort({ organization: 1 }).lean();
  return JSON.parse(JSON.stringify(customers));
}

export async function createCustomer(data: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();

  // If user is admin, they can specify the region/branch. Otherwise, inherit.
  const regionInput = data.get("region") as string;
  const branchInput = data.get("branch") as string;

  const customerData = {
    customerName: data.get("customerName") as string,
    address: data.get("address") as string,
    organization: data.get("organization") as string,
    region: session.user.role === "admin" && regionInput ? regionInput : session.user.region,
    branch: session.user.role === "admin" && branchInput ? branchInput : session.user.branch,
    pinCode: data.get("pinCode") as string | undefined,
    state: data.get("state") as string | undefined,
    district: data.get("district") as string | undefined,
    contactPersonName: data.get("contactPersonName") as string | undefined,
    contactNo: data.get("contactNo") as string | undefined,
    createdBy: session.user.id,
  };

  await Customer.create(customerData);
  revalidatePath("/customers");
  return { success: true };
}

export async function updateCustomer(id: string, data: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();

  const regionInput = data.get("region") as string;
  const branchInput = data.get("branch") as string;

  const customerData = {
    customerName: data.get("customerName") as string,
    address: data.get("address") as string,
    organization: data.get("organization") as string,
    region: session.user.role === "admin" && regionInput ? regionInput : session.user.region,
    branch: session.user.role === "admin" && branchInput ? branchInput : session.user.branch,
    pinCode: data.get("pinCode") as string | undefined,
    state: data.get("state") as string | undefined,
    district: data.get("district") as string | undefined,
    contactPersonName: data.get("contactPersonName") as string | undefined,
    contactNo: data.get("contactNo") as string | undefined,
  };

  await Customer.findByIdAndUpdate(id, customerData);
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return { success: true };
}
