import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    const email = "admin@hostel.com";
    const password = process.env.ADMIN_PASSWORD;

    if (!password || password.length < 8) {
      throw new Error("Set ADMIN_PASSWORD with at least 8 characters");
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: "Hostel Admin",
      email,
      password: hashedPassword,
      role: "Admin"
    });

    console.log("Admin account created successfully");
    console.log("Admin email:", email);

  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();