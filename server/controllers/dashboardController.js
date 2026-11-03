import Student from "../models/Student.js";
import Fee from "../models/Fee.js";
import Complaint from "../models/Complaint.js";
import Attendance from "../models/Attendance.js";
import Outing from "../models/Outing.js";
import Holiday from "../models/Holiday.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalFees,
      totalComplaints,
      pendingComplaints,
      totalAttendance,
      presentAttendance,
      absentAttendance,
      pendingOutings,
      approvedOutings,
      totalHolidays,
    ] = await Promise.all([
      Student.countDocuments(),

      Fee.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),

      Complaint.countDocuments(),

      Complaint.countDocuments({
        status: "Pending",
      }),

      Attendance.countDocuments(),

      Attendance.countDocuments({
        status: "Present",
      }),

      Attendance.countDocuments({
        status: "Absent",
      }),

      Outing.countDocuments({
        status: "Pending",
      }),

      Outing.countDocuments({
        status: "Approved",
      }),

      Holiday.countDocuments(),
    ]);

    res.status(200).json({
      totalStudents,
      totalFees: totalFees[0]?.total || 0,
      totalComplaints,
      pendingComplaints,
      totalAttendance,
      presentAttendance,
      absentAttendance,
      pendingOutings,
      approvedOutings,
      totalHolidays,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};