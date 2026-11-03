import Student from "../models/Student.js";
import Fee from "../models/Fee.js";
import Attendance from "../models/Attendance.js";
import Complaint from "../models/Complaint.js";
import Outing from "../models/Outing.js";

export const getStudentReport = async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeeReport = async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate("student", "name studentId")
      .sort({ createdAt: -1 });

    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("student", "name studentId")
      .sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getComplaintReport = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("student", "name studentId")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOutingReport = async (req, res) => {
  try {
    const outings = await Outing.find()
      .populate("student", "name studentId")
      .sort({ createdAt: -1 });

    res.status(200).json(outings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};