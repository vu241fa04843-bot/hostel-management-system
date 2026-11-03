import express from "express";

import {
  getOutings,
  createOuting,
  updateOuting,
  deleteOuting,
} from "../controllers/outingController.js";

const router = express.Router();

router.get("/", getOutings);
router.post("/", createOuting);
router.patch("/:id", updateOuting);
router.delete("/:id", deleteOuting);

export default router;