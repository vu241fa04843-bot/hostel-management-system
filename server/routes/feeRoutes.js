
import express from "express";
import {
  getFees,
  createFee,
  addPayment,
  deleteFee,
} from "../controllers/feeController.js";

const router = express.Router();

router.get("/", getFees);
router.post("/", createFee);
router.post("/:id/payments", addPayment);
router.delete("/:id", deleteFee);

export default router;