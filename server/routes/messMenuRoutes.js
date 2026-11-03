
import express from "express";

import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu
} from "../controllers/messMenuController.js";

import {
  verifyToken,
  authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Both Admin and Student can view menus
router.get("/", verifyToken, getMenus);

// Only Admin can manage menus
router.post("/", verifyToken, authorizeRoles("Admin"), createMenu);

router.patch("/:id", verifyToken, authorizeRoles("Admin"), updateMenu);

router.delete("/:id", verifyToken, authorizeRoles("Admin"), deleteMenu);

export default router;
