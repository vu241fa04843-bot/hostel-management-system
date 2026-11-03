import express from "express";
import { getMyMealRecords } from "../controllers/studentMealController.js";
import {
  verifyToken,
  authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/my-meals",
  verifyToken,
  authorizeRoles("Student"),
  getMyMealRecords
);

export default router;