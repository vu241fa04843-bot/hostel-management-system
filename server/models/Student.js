import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    studentId: {
      type: String,
      required: true,
      unique: true
    },

    email: {
      type: String,
      required: true
    },

    phone: {
      type: String
    },

    department: {
      type: String,
      required: true
    },

    year: {
      type: Number,
      required: true
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    },

    roomNumber: {
      type: String
    },

    guardianName: {
      type: String
    },

    guardianPhone: {
      type: String
    },

    address: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;