import express from "express";

import {
  verifyToken,
  authorizeRoles
} from "../middleware/authMiddleware.js";

import {
  createMyOuting,
  getMyOutings
} from "../controllers/studentOutingController.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("Student"),
  createMyOuting
);

router.get(
  "/",
  verifyToken,
  authorizeRoles("Student"),
  getMyOutings
);

export default router;