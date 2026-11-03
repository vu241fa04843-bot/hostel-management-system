
import express from "express";

import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  allocateStudent,
  removeStudentAllocation
} from "../controllers/roomController.js";

const router = express.Router();

router.get("/", getRooms);
router.post("/", createRoom);

router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

router.post("/:id/allocate", allocateStudent);

router.delete(
  "/:id/students/:studentId",
  removeStudentAllocation
);

export default router;