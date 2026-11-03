import express from "express";

import {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.get("/", getAttendance);
router.post("/", createAttendance);
router.patch("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

export default router;