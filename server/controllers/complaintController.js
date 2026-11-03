
import mongoose from "mongoose";
import Complaint from "../models/Complaint.js";
import Student from "../models/Student.js";

const allowedCategories = [
  "Room",
  "Food",
  "Cleaning",
  "Water",
  "Electricity",
  "Wi-Fi",
  "Other",
];

const allowedStatuses = ["Pending", "In Progress", "Resolved"];

export async function getComplaints(req, res) {
  try {
    const complaints = await Complaint.find()
      .populate("student", "name studentId email roomNumber")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to load complaints." });
  }
}

export async function createComplaint(req, res) {
  try {
    const { studentId, title, category, description } = req.body;

    if (!studentId || !mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Select a valid student." });
    }

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Title and description are required.",
      });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid complaint category." });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const complaint = await Complaint.create({
      student: student._id,
      title: title.trim(),
      category,
      description: description.trim(),
    });

    const result = await complaint.populate(
      "student",
      "name studentId email roomNumber"
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to create complaint." });
  }
}

export async function updateComplaint(req, res) {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid complaint ID." });
    }

    if (
      status !== undefined &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({ message: "Invalid complaint status." });
    }

    if (
      adminRemarks !== undefined &&
      typeof adminRemarks !== "string"
    ) {
      return res.status(400).json({ message: "Invalid admin remarks." });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    if (status !== undefined) complaint.status = status;

    if (adminRemarks !== undefined) {
      complaint.adminRemarks = adminRemarks.trim();
    }

    await complaint.save();

    await complaint.populate(
      "student",
      "name studentId email roomNumber"
    );

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Failed to update complaint." });
  }
}

export async function deleteComplaint(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid complaint ID." });
    }

    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    res.json({ message: "Complaint deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete complaint." });
  }
}