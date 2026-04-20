import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import User from "../lib/models/User";
import bcrypt from "bcryptjs";

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/amc-tracker";
  
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const email = "admin@gmail.com";
  const password = "admin@1234";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin user already exists! You can log in with:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  await User.create({
    name: "System Admin",
    email,
    passwordHash,
    role: "admin",
    isActive: true,
  });

  console.log("\n=========================");
  console.log("🚀 Admin User Seeded!");
  console.log("Email: admin@example.com");
  console.log("Password: password123");
  console.log("=========================\n");
  
  process.exit(0);
}

seed().catch(err => {
  console.error("Failed to seed:", err);
  process.exit(1);
});
