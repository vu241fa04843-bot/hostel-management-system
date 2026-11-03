
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Other"],
      default: "Cash",
    },
    reference: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    billingPeriod: {
      type: String,
      required: true,
      trim: true,
    },
    totalFee: {
      type: Number,
      required: true,
      min: 0.01,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    payments: {
      type: [paymentSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

feeSchema.index(
  { student: 1, billingPeriod: 1 },
  { unique: true }
);

feeSchema.virtual("amountPaid").get(function () {
  return this.payments.reduce(
    (total, payment) => total + payment.amount,
    0
  );
});

feeSchema.virtual("balance").get(function () {
  return Math.max(0, this.totalFee - this.amountPaid);
});

feeSchema.virtual("status").get(function () {
  if (this.amountPaid >= this.totalFee) return "Paid";
  if (this.amountPaid > 0) return "Partially Paid";
  return "Pending";
});

const Fee = mongoose.model("Fee", feeSchema);

export default Fee;