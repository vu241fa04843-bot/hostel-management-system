import mongoose from "mongoose";
import Outing from "../models/Outing.js";
import Student from "../models/Student.js";

// Get all outing requests
export const getOutings = async (req, res) => {
  try {
    const outings = await Outing.find()
      .populate("student", "name studentId")
      .sort({ createdAt: -1 });

    res.status(200).json(outings);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Create outing request
export const createOuting = async (req, res) => {
  try {
    const {
      student,
      destination,
      purpose,
      outingDate,
      returnDate,
    } = req.body;

    if (
      !student ||
      !destination ||
      !purpose ||
      !outingDate ||
      !returnDate
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(student)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    const studentExists = await Student.findById(student);

    if (!studentExists) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const start = new Date(outingDate);
    const end = new Date(returnDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return res.status(400).json({
        message: "Return date must be after outing date",
      });
    }

    const outing = await Outing.create({
      student,
      destination,
      purpose,
      outingDate: start,
      returnDate: end,
      status: "Pending",
    });

    const result = await Outing.findById(outing._id)
      .populate("student", "name studentId");

    res.status(201).json({
      message: "Outing request submitted successfully",
      outing: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update outing status
export const updateOuting = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (
      !["Pending", "Approved", "Rejected"].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid outing status",
      });
    }

    const outing = await Outing.findByIdAndUpdate(
      req.params.id,
      { status, remarks },
      { new: true, runValidators: true }
    ).populate("student", "name studentId");

    if (!outing) {
      return res.status(404).json({
        message: "Outing request not found",
      });
    }

    res.status(200).json({
      message: "Outing status updated successfully",
      outing,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete outing request
export const deleteOuting = async (req, res) => {
  try {
    const outing = await Outing.findByIdAndDelete(
      req.params.id
    );

    if (!outing) {
      return res.status(404).json({
        message: "Outing request not found",
      });
    }

    res.status(200).json({
      message: "Outing request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};