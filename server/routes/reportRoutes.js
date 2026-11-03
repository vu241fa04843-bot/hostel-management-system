import express from "express";

import {
  getStudentReport,
  getFeeReport,
  getAttendanceReport,
  getComplaintReport,
  getOutingReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/students", getStudentReport);
router.get("/fees", getFeeReport);
router.get("/attendance", getAttendanceReport);
router.get("/complaints", getComplaintReport);
router.get("/outings", getOutingReport);

export default router;