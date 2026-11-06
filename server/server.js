
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

// Admin and common routes
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

// Student-specific routes
import studentFeeRoutes from "./routes/studentFeeRoutes.js";
import studentComplaintRoutes from "./routes/studentComplaintRoutes.js";
import studentOutingRoutes from "./routes/studentOutingRoutes.js";
import studentMealRoutes from "./routes/studentMealRoutes.js";
import studentAttendanceRoutes from "./routes/studentAttendanceRoutes.js";

// Middleware
import {
  verifyToken,
  authorizeRoles
} from "./middleware/authMiddleware.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/complaints", complaintRoutes);

app.use("/api/mess-menus", verifyToken, messMenuRoutes);
app.use(
  "/api/meal-records",
  verifyToken,
  authorizeRoles("Admin"),
  mealRecordRoutes
);

app.use("/api/attendance", verifyToken, attendanceRoutes);
app.use("/api/outings", verifyToken, outingRoutes);
app.use("/api/holidays", verifyToken, holidayRoutes);

app.use("/api/dashboard", verifyToken, dashboardRoutes);
app.use("/api/reports", verifyToken, reportRoutes);

// Student routes
app.use("/api/student-fees", studentFeeRoutes);
app.use("/api/student-complaints", studentComplaintRoutes);
app.use("/api/student-outings", studentOutingRoutes);
app.use("/api/student-meals", studentMealRoutes);
app.use("/api/student-attendance", studentAttendanceRoutes);

// Home API
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hostel Management API is running successfully"
  });
});

// Health check API
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "Backend is healthy"
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("MongoDB connection established");
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
