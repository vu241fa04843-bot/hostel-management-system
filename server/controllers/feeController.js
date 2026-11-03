
import mongoose from "mongoose";
import Fee from "../models/Fee.js";
import Student from "../models/Student.js";

export const getFees = async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate("student", "name studentId email roomNumber")
      .sort({ createdAt: -1 });

    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch fee records.",
    });
  }
};

export const createFee = async (req, res) => {
  try {
    const {
      studentId,
      billingPeriod,
      totalFee,
      dueDate,
      notes,
    } = req.body;

    if (
      !mongoose.isValidObjectId(studentId) ||
      !billingPeriod?.trim() ||
      totalFee === undefined ||
      !dueDate
    ) {
      return res.status(400).json({
        message:
          "Student, billing period, total fee, and due date are required.",
      });
    }

    const amount = Number(totalFee);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Total fee must be greater than zero.",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid due date.",
      });
    }

    const fee = await Fee.create({
      student: student._id,
      billingPeriod: billingPeriod.trim(),
      totalFee: amount,
      dueDate: parsedDueDate,
      notes: notes || "",
    });

    const populatedFee = await Fee.findById(fee._id)
      .populate("student", "name studentId email roomNumber");

    res.status(201).json(populatedFee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A fee record already exists for this student and billing period.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to create fee record.",
    });
  }
};

export const addPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate, method, reference } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid fee record ID.",
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than zero.",
      });
    }

    const allowedMethods = [
      "Cash",
      "UPI",
      "Bank Transfer",
      "Other",
    ];

    if (method && !allowedMethods.includes(method)) {
      return res.status(400).json({
        message: "Invalid payment method.",
      });
    }

    const parsedPaymentDate =
      paymentDate === undefined
        ? new Date()
        : new Date(paymentDate);

    if (Number.isNaN(parsedPaymentDate.getTime())) {
      return res.status(400).json({
        message: "Please provide a valid payment date.",
      });
    }

    const fee = await Fee.findById(id);

    if (!fee) {
      return res.status(404).json({
        message: "Fee record not found.",
      });
    }

    const amountPaid = fee.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const balance = Math.max(0, fee.totalFee - amountPaid);

    if (paymentAmount > balance + 0.000001) {
      return res.status(400).json({
        message: `Payment exceeds the outstanding balance of ₹${balance.toFixed(2)}.`,
      });
    }

    fee.payments.push({
      amount: paymentAmount,
      paymentDate: parsedPaymentDate,
      method: method || "Cash",
      reference: reference || "",
    });

    await fee.save();

    const updatedFee = await Fee.findById(id)
      .populate("student", "name studentId email roomNumber");

    res.status(200).json({
      message: "Payment recorded successfully.",
      fee: updatedFee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to record payment.",
    });
  }
};

export const deleteFee = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid fee record ID.",
      });
    }

    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        message: "Fee record not found.",
      });
    }

    if (fee.payments.length > 0) {
      return res.status(400).json({
        message:
          "This fee record has payment history and cannot be deleted.",
      });
    }

    await fee.deleteOne();

    res.status(200).json({
      message: "Fee record deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete fee record.",
    });
  }
};