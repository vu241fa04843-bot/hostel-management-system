
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const resetAdminPassword = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@hostel.com";
    const newPassword = process.env.ADMIN_PASSWORD;

    if (!newPassword || newPassword.length < 8) {
      throw new Error(
        "Set a new ADMIN_PASSWORD with at least 8 characters in .env"
      );
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    const admin = await User.findOne({
      email: email.toLowerCase(),
      role: "Admin"
    });

    if (!admin) {
      throw new Error("Admin account not found for this email");
    }

    admin.password = await bcrypt.hash(newPassword, 12);
    await admin.save();

    console.log("Admin password reset successfully!");
    console.log("Admin email:", email);

  } catch (error) {
    console.error("Password reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

resetAdminPassword();
