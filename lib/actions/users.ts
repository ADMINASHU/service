"use server";

import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers(page = 1, limit = 15, queryStr?: string) {
  await connectToDatabase();
  const query: any = {};
  if (queryStr) {
    query.$or = [
      { name: { $regex: queryStr, $options: "i" } },
      { email: { $regex: queryStr, $options: "i" } },
      { region: { $regex: queryStr, $options: "i" } }
    ];
  }
  
  const skip = (page - 1) * limit;
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
  const total = await User.countDocuments(query);
  
  return {
    users: JSON.parse(JSON.stringify(users)),
    total,
    pages: Math.ceil(total / limit)
  };
}

export async function createUser(data: FormData) {
  const session = await auth();
  if (session?.user?.role !== "admin") throw new Error("Unauthorized");

  await connectToDatabase();

  const email = data.get("email") as string;
  const password = data.get("password") as string;
  
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already in use");

  const passwordHash = await bcrypt.hash(password, 10);

  const userData = {
    name: data.get("name") as string,
    email,
    passwordHash,
    role: (data.get("role") as string) || "user",
    region: data.get("region") as string | undefined,
    branch: data.get("branch") as string | undefined,
    isActive: data.get("isActive") === "true",
  };

  await User.create(userData);
  revalidatePath("/users");
  return { success: true };
}
