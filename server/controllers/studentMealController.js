import User from "../models/User.js";
import Student from "../models/Student.js";
import MealRecord from "../models/MealRecord.js";

export async function getMyMealRecords(req, res) {
  try {
    // Find the logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Find the corresponding student
    const student = await Student.findOne({
      email: user.email
    });

    if (!student) {
      return res.status(404).json({
        message: "Student record not found."
      });
    }

    // Fetch only this student's meal records
    const records = await MealRecord.find({
      student: student._id
    }).sort({
      date: -1,
      createdAt: -1
    });

    res.json(records);

  } catch (error) {
    console.error("Student meal history error:", error);

    res.status(500).json({
      message: "Could not load your meal history."
    });
  }
}