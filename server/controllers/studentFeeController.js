import User from "../models/User.js";
import Student from "../models/Student.js";
import Fee from "../models/Fee.js";

export const getMyFees = async (req, res) => {
  try {
    // Get logged-in user ID from verified JWT
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token. Please login again."
      });
    }

    // Find the actual user in MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Login account not found"
      });
    }

    // Get email from the User collection
    const email = user.email.trim().toLowerCase();

    // Find matching hostel student record
    const student = await Student.findOne({
      email: { $regex: `^${email}$`, $options: "i" }
    });

    if (!student) {
      return res.status(404).json({
        message: "Student record not found. Contact the hostel admin."
      });
    }

    // Get fees belonging to this student
    const fees = await Fee.find({
      student: student._id
    }).sort({ dueDate: -1 });

    return res.status(200).json({
      message: "Fee details fetched successfully",

      student: {
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        department: student.department,
        year: student.year,
        roomNumber: student.roomNumber
      },

      fees
    });

  } catch (error) {
    console.error("Student fee error:", error);

    return res.status(500).json({
      message: "Unable to fetch student fees",
      error: error.message
    });
  }
};