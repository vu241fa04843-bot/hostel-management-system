import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: ["National", "Festival", "College", "Other"],
      default: "Other",
    },
  },
  {
    timestamps: true,
  }
);

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;