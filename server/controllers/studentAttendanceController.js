import User from "../models/User.js";
import Student from "../models/Student.js";
import Attendance from "../models/Attendance.js";

export const getMyAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const student = await Student.findOne({ email: user.email });

    if (!student) {
      return res.status(404).json({
        message: "Student record not found. Contact the Admin."
      });
    }

    const records = await Attendance.find({
      student: student._id
    }).sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    console.error("Student attendance error:", error);
    res.status(500).json({
      message: "Could not load attendance records."
    });
  }
};