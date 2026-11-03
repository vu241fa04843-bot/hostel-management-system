
import mongoose from "mongoose";

const mealRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Snacks", "Dinner"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

mealRecordSchema.index(
  { student: 1, date: 1, mealType: 1 },
  { unique: true }
);

mealRecordSchema.virtual("totalCost").get(function () {
  return this.quantity * this.rate;
});

mealRecordSchema.set("toJSON", { virtuals: true });
mealRecordSchema.set("toObject", { virtuals: true });

export default mongoose.model("MealRecord", mealRecordSchema);
