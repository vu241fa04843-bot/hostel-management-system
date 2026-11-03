import User from "../models/User.js";
import Student from "../models/Student.js";
import Complaint from "../models/Complaint.js";

// Find the hostel Student linked to the logged-in account
const getLoggedInStudent = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  return Student.findOne({
    email: user.email
  });
};

// SUBMIT A COMPLAINT
export const createMyComplaint = async (req, res) => {
  try {
    const student = await getLoggedInStudent(req.user.id);

    if (!student) {
      return res.status(404).json({
        message: "Student record not found"
      });
    }

    const { title, category, description } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        message: "Please provide title, category and description"
      });
    }

    const complaint = await Complaint.create({
      student: student._id,
      title,
      category,
      description
    });

    return res.status(201).json({
      message: "Complaint submitted successfully",
      complaint
    });

  } catch (error) {
    return res.status(500).json({
      message: "Unable to submit complaint",
      error: error.message
    });
  }
};

// GET ONLY THE LOGGED-IN STUDENT'S COMPLAINTS
export const getMyComplaints = async (req, res) => {
  try {
    const student = await getLoggedInStudent(req.user.id);

    if (!student) {
      return res.status(404).json({
        message: "Student record not found"
      });
    }

    const complaints = await Complaint.find({
      student: student._id
    }).sort({ createdAt: -1 });

    return res.status(200).json(complaints);

  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch complaints",
      error: error.message
    });
  }
};