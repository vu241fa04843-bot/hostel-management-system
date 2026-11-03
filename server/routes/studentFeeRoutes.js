import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { getMyFees } from "../controllers/studentFeeController.js";

const router = express.Router();

router.get(
  "/my-fees",
  verifyToken,
  authorizeRoles("Student"),
  getMyFees
);

export default router;