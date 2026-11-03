import express from "express";
import {
  verifyToken,
  authorizeRoles
} from "../middleware/authMiddleware.js";

import {
  createMyComplaint,
  getMyComplaints
} from "../controllers/studentComplaintController.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("Student"),
  createMyComplaint
);

router.get(
  "/",
  verifyToken,
  authorizeRoles("Student"),
  getMyComplaints
);

export default router;