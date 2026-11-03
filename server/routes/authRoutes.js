import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getStudentProfile } from "../controllers/profileController.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getStudentProfile);

export default router;