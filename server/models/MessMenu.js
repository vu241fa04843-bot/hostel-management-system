
import mongoose from "mongoose";

const messMenuSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Snacks", "Dinner"],
      required: true,
    },
    items: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  { timestamps: true }
);

messMenuSchema.index({ date: 1, mealType: 1 }, { unique: true });

export default mongoose.model("MessMenu", messMenuSchema);