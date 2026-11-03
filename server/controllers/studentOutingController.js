import User from "../models/User.js";
import Student from "../models/Student.js";
import Outing from "../models/Outing.js";

// Find the hostel student linked to the logged-in user
const getLoggedInStudent = async (userId) => {
  const user = await User.findById(userId);

  if (!user) return null;

  return Student.findOne({
    email: user.email
  });
};

// SUBMIT OUTING REQUEST
export const createMyOuting = async (req, res) => {
  try {
    const student = await getLoggedInStudent(req.user.id);

    if (!student) {
      return res.status(404).json({
        message: "Student record not found"
      });
    }

    const {
      destination,
      purpose,
      outingDate,
      returnDate
    } = req.body;

    if (!destination || !purpose || !outingDate || !returnDate) {
      return res.status(400).json({
        message: "Please fill all outing details"
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
        message: "Return date must be after outing date"
      });
    }

    const outing = await Outing.create({
      student: student._id,
      destination,
      purpose,
      outingDate: start,
      returnDate: end
    });

    return res.status(201).json({
      message: "Outing request submitted successfully",
      outing
    });

  } catch (error) {
    return res.status(500).json({
      message: "Unable to submit outing request",
      error: error.message
    });
  }
};

// GET ONLY MY OUTING REQUESTS
export const getMyOutings = async (req, res) => {
  try {
    const student = await getLoggedInStudent(req.user.id);

    if (!student) {
      return res.status(404).json({
        message: "Student record not found"
      });
    }

    const outings = await Outing.find({
      student: student._id
    }).sort({ createdAt: -1 });

    return res.status(200).json(outings);

  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch outing requests",
      error: error.message
    });
  }
};