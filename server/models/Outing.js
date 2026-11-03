import mongoose from "mongoose";

const outingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
    },

    outingDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Outing = mongoose.model("Outing", outingSchema);

export default Outing;