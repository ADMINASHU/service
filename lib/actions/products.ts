"use server";

import connectToDatabase from "@/lib/db";
import Product from "@/lib/models/Product";
import Customer from "@/lib/models/Customer";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

export async function createProduct(customerId: string, data: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();

  const customer = await Customer.findById(customerId);
  if (!customer) throw new Error("Customer not found");

  let serialNo = data.get("serialNo") as string;
  let isAutoSerial = false;
  if (!serialNo || serialNo.trim() === "") {
    serialNo = `AUTO-${nanoid(10).toUpperCase()}`;
    isAutoSerial = true;
  }

  const amcPeriod = data.get("amcPeriod") ? parseInt(data.get("amcPeriod") as string) : undefined;
  const warrantyPeriod = data.get("warrantyPeriod") ? parseInt(data.get("warrantyPeriod") as string) : undefined;
  const amcStartDate = data.get("amcStartDate") ? new Date(data.get("amcStartDate") as string) : undefined;
  const installationDate = data.get("installationDate") ? new Date(data.get("installationDate") as string) : undefined;
  const vFreq = data.get("visitFrequency") as string;

  const productData = {
    customerId,
    type: data.get("type") as string,
    rating: data.get("rating") as string | undefined,
    dcVolt: data.get("dcVolt") as string | undefined,
    ah: data.get("ah") as string | undefined,
    qty: data.get("qty") ? parseInt(data.get("qty") as string) : 1,
    phase: data.get("phase") as string | undefined,
    serialNo,
    isAutoSerial,
    configuration: data.get("configuration") as string | undefined,
    batteryType: data.get("batteryType") as string | undefined,
    make: data.get("make") as string | undefined,
    warrantyPeriod,
    installationDate,
    amcStartDate,
    amcPeriod,
    visitFrequency: vFreq && vFreq !== "null" ? vFreq : null,
    note: data.get("note") as string | undefined,
  };

  await Product.create(productData);
  revalidatePath(`/customers/${customerId}`);
  return { success: true };
}

export async function getProductsByCustomer(customerId: string) {
  await connectToDatabase();
  const products = await Product.find({ customerId }).sort({ createdAt: -1 }).lean();
  
  return JSON.parse(JSON.stringify(products));
}

export async function getProductById(productId: string) {
  await connectToDatabase();
  const product = await Product.findById(productId).lean();
  return JSON.parse(JSON.stringify(product));
}

export async function updateProduct(productId: string, data: FormData, customerId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await connectToDatabase();

  const vFreq = data.get("visitFrequency") as string;
  const updateData = {
    type: data.get("type") as string,
    rating: data.get("rating") as string | undefined,
    dcVolt: data.get("dcVolt") as string | undefined,
    ah: data.get("ah") as string | undefined,
    qty: data.get("qty") ? parseInt(data.get("qty") as string) : 1,
    phase: data.get("phase") as string | undefined,
    serialNo: data.get("serialNo") as string,
    configuration: data.get("configuration") as string | undefined,
    batteryType: data.get("batteryType") as string | undefined,
    make: data.get("make") as string | undefined,
    warrantyPeriod: data.get("warrantyPeriod") ? parseInt(data.get("warrantyPeriod") as string) : undefined,
    installationDate: data.get("installationDate") ? new Date(data.get("installationDate") as string) : undefined,
    amcStartDate: data.get("amcStartDate") ? new Date(data.get("amcStartDate") as string) : undefined,
    amcPeriod: data.get("amcPeriod") ? parseInt(data.get("amcPeriod") as string) : undefined,
    visitFrequency: vFreq && vFreq !== "null" ? vFreq : null,
    note: data.get("note") as string | undefined,
  };

  await Product.findByIdAndUpdate(productId, updateData);
  revalidatePath(`/customers/${customerId}`);
  revalidatePath(`/products`);
  return { success: true };
}

export async function getAllProducts(page = 1, limit = 15, queryStr?: string) {
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

  if (queryStr) {
    baseMatch.$or = [
      { type: { $regex: queryStr, $options: "i" } },
      { serialNo: { $regex: queryStr, $options: "i" } },
      { make: { $regex: queryStr, $options: "i" } }
    ];
  }

  const query = { ...baseMatch };
  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .populate('customerId', 'customerName organization')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
  const total = await Product.countDocuments(query);
  
  return {
    products: JSON.parse(JSON.stringify(products)),
    total,
    pages: Math.ceil(total / limit)
  };
}
