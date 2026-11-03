
import User from "../models/User.js";

export const getStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      registrationNumber: user.registrationNumber || "",
      branch: user.branch || "",
      yearOfStudy: user.yearOfStudy || "",
      role: user.role,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error("Profile fetching error:", error);

    return res.status(500).json({
      message: "Error fetching profile"
    });
  }
};
