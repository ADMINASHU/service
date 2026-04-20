"use server";

import connectToDatabase from "@/lib/db";
import Setting from "@/lib/models/Setting";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  await connectToDatabase();
  const settings = await Setting.find().lean();
  return JSON.parse(JSON.stringify(settings));
}

export async function updateSetting(key: string, values: string[]) {
  const session = await auth();
  if (session?.user?.role !== 'admin') throw new Error("Unauthorized");

  await connectToDatabase();
  
  await Setting.findOneAndUpdate(
    { key },
    { key, values },
    { upsert: true, new: true }
  );

  revalidatePath("/settings");
  revalidatePath("/customers");
  revalidatePath("/products");
  revalidatePath("/users");
  
  return { success: true };
}

export async function getSettingByKey(key: string) {
  await connectToDatabase();
  const setting = await Setting.findOne({ key }).lean();
  return JSON.parse(JSON.stringify(setting))?.values || [];
}
