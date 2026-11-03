
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    registrationNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },

    branch: {
      type: String,
      trim: true,
      default: ""
    },

    yearOfStudy: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year", "4th Year", ""],
      default: ""
    },

    role: {
      type: String,
      enum: ["Admin", "Student"],
      default: "Student"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
