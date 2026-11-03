import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import studentRoutes from "./routes/studentRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import messMenuRoutes from "./routes/messMenuRoutes.js";
import mealRecordRoutes from "./routes/mealRecordRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import outingRoutes from "./routes/outingRoutes.js";
import holidayRoutes from "./routes/holidayRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import { authorizeRoles } from "./middleware/authMiddleware.js";
import studentFeeRoutes from "./routes/studentFeeRoutes.js";
import studentComplaintRoutes from "./routes/studentComplaintRoutes.js";
import studentOutingRoutes from "./routes/studentOutingRoutes.js";
import studentMealRoutes from "./routes/studentMealRoutes.js";
import studentAttendanceRoutes from "./routes/studentAttendanceRoutes.js";
dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/mess-menus", verifyToken, messMenuRoutes);
app.use("/api/meal-records", verifyToken, authorizeRoles("Admin"), mealRecordRoutes);
app.use("/api/attendance", verifyToken, attendanceRoutes);
app.use("/api/outings", verifyToken, outingRoutes);
app.use("/api/holidays", verifyToken, holidayRoutes);
app.use("/api/dashboard", verifyToken, dashboardRoutes);
app.use("/api/reports", verifyToken, reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student-fees", studentFeeRoutes);
app.use("/api/student-complaints", studentComplaintRoutes);
app.use("/api/student-outings", studentOutingRoutes);
app.use("/api/student-meals", studentMealRoutes);
app.use("/api/student-attendance", studentAttendanceRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Hostel Management API is running successfully"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});