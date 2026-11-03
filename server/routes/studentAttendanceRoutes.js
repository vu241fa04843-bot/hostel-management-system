import express from "express";
import { getMyAttendance } from "../controllers/studentAttendanceController.js";
import {
  verifyToken,
  authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/my-attendance",
  verifyToken,
  authorizeRoles("Student"),
  getMyAttendance
);

export default router;