
import express from "express";
import {
  getMealRecords,
  createMealRecord,
  deleteMealRecord,
} from "../controllers/mealRecordController.js";

const router = express.Router();

router.get("/", getMealRecords);
router.post("/", createMealRecord);
router.delete("/:id", deleteMealRecord);

export default router;