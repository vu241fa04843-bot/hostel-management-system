import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

// Get all attendance records
export const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("student", "name studentId")
      .sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add attendance
export const createAttendance = async (req, res) => {
  try {
    const { student, date, status, remarks } = req.body;

    if (!student || !date || !status) {
      return res.status(400).json({
        message: "Student, date and status are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(student)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    const validStatuses = ["Present", "Absent", "Leave"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance status",
      });
    }

    const selectedDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    const studentExists = await Student.findById(student);

    if (!studentExists) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const record = await Attendance.create({
      student,
      date: selectedDate,
      status,
      remarks,
    });

    const populatedRecord = await Attendance.findById(record._id)
      .populate("student", "name studentId");

    res.status(201).json({
      message: "Attendance added successfully",
      attendance: populatedRecord,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Attendance already exists for this student and date",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Update attendance
export const updateAttendance = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!["Present", "Absent", "Leave"].includes(status)) {
      return res.status(400).json({
        message: "Invalid attendance status",
      });
    }

    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, remarks },
      { new: true, runValidators: true }
    ).populate("student", "name studentId");

    if (!record) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      message: "Attendance updated successfully",
      attendance: record,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete attendance
export const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    res.status(200).json({
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};