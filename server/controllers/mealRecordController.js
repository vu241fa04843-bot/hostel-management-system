
import mongoose from "mongoose";
import MealRecord from "../models/MealRecord.js";
import Student from "../models/Student.js";

const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];

function parseDate(value) {
  if (typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getMealRecords(req, res) {
  try {
    const records = await MealRecord.find()
      .populate("student", "name studentId email roomNumber")
      .sort({ date: -1, createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Could not load meal records." });
  }
}

export async function createMealRecord(req, res) {
  try {
    const { studentId, date, mealType, quantity = 1, rate } = req.body;
    const parsedDate = parseDate(date);
    const numericQuantity = Number(quantity);
    const numericRate = Number(rate);

    if (!mongoose.isValidObjectId(studentId) ||
        !parsedDate ||
        !mealTypes.includes(mealType) ||
        !Number.isInteger(numericQuantity) ||
        numericQuantity < 1 ||
        !Number.isFinite(numericRate) ||
        numericRate < 0) {
      return res.status(400).json({
        message: "Enter a valid student, date, meal, quantity, and rate.",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const record = await MealRecord.create({
      student: studentId,
      date: parsedDate,
      mealType,
      quantity: numericQuantity,
      rate: numericRate,
    });

    const populatedRecord = await MealRecord.findById(record._id)
      .populate("student", "name studentId email roomNumber");

    res.status(201).json(populatedRecord);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This student already has a record for that meal and date.",
      });
    }
    res.status(500).json({ message: "Could not create meal record." });
  }
}

export async function deleteMealRecord(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid meal record ID." });
    }

    const record = await MealRecord.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Meal record not found." });
    }

    res.json({ message: "Meal record deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete meal record." });
  }
}