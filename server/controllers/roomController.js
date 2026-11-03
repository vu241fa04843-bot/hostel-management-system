
import mongoose from "mongoose";
import Room from "../models/Room.js";
import Student from "../models/Student.js";

// Generate the room label stored in the Student document.
const roomLabel = (room) =>
  `${room.block} - Room ${room.roomNumber}`;

// GET /api/rooms
// Get all rooms with student details and bed availability.
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate(
        "students",
        "name studentId email department year"
      )
      .sort({ block: 1, floor: 1, roomNumber: 1 });

    const result = rooms.map((room) => {
      const item = room.toObject();
      const occupiedBeds = item.students.length;

      return {
        ...item,
        occupiedBeds,
        availableBeds: item.capacity - occupiedBeds,
        status:
          occupiedBeds >= item.capacity
            ? "Full"
            : "Available"
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get rooms error:", error);

    return res.status(500).json({
      message: "Failed to retrieve rooms."
    });
  }
};

// POST /api/rooms
// Create a new room.
export const createRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      block,
      floor,
      capacity,
      monthlyFee
    } = req.body;

    if (
      !String(roomNumber ?? "").trim() ||
      !String(block ?? "").trim() ||
      floor === undefined ||
      floor === "" ||
      capacity === undefined ||
      capacity === "" ||
      monthlyFee === undefined ||
      monthlyFee === ""
    ) {
      return res.status(400).json({
        message: "Please fill in all room fields."
      });
    }

    const parsedFloor = Number(floor);
    const parsedCapacity = Number(capacity);
    const parsedFee = Number(monthlyFee);

    if (
      !Number.isInteger(parsedFloor) ||
      parsedFloor < 0 ||
      parsedFloor > 100
    ) {
      return res.status(400).json({
        message: "Floor must be a whole number from 0 to 100."
      });
    }

    if (
      !Number.isInteger(parsedCapacity) ||
      parsedCapacity < 2 ||
      parsedCapacity > 4
    ) {
      return res.status(400).json({
        message: "Room capacity must be between 2 and 4."
      });
    }

    if (
      !Number.isFinite(parsedFee) ||
      parsedFee < 0
    ) {
      return res.status(400).json({
        message: "Monthly fee must be zero or greater."
      });
    }

    const room = await Room.create({
      roomNumber: String(roomNumber).trim(),
      block: String(block).trim(),
      floor: parsedFloor,
      capacity: parsedCapacity,
      monthlyFee: parsedFee,
      students: []
    });

    return res.status(201).json({
      message: "Room created successfully.",
      room
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This room number already exists in the selected block."
      });
    }

    console.error("Create room error:", error);

    return res.status(500).json({
      message: "Failed to create room."
    });
  }
};

// PUT /api/rooms/:id
// Update room information and synchronize assigned students.
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid room ID."
      });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found."
      });
    }

    // Save the previous label before changing room details.
    const oldRoomLabel = roomLabel(room);

    const {
      roomNumber,
      block,
      floor,
      capacity,
      monthlyFee
    } = req.body;

    const nextRoomNumber =
      roomNumber === undefined
        ? room.roomNumber
        : String(roomNumber).trim();

    const nextBlock =
      block === undefined
        ? room.block
        : String(block).trim();

    const nextFloor =
      floor === undefined ? room.floor : Number(floor);

    const nextCapacity =
      capacity === undefined
        ? room.capacity
        : Number(capacity);

    const nextMonthlyFee =
      monthlyFee === undefined
        ? room.monthlyFee
        : Number(monthlyFee);

    if (!nextRoomNumber || !nextBlock) {
      return res.status(400).json({
        message: "Room number and block are required."
      });
    }

    if (
      !Number.isInteger(nextFloor) ||
      nextFloor < 0 ||
      nextFloor > 100
    ) {
      return res.status(400).json({
        message: "Floor must be a whole number from 0 to 100."
      });
    }

    if (
      !Number.isInteger(nextCapacity) ||
      nextCapacity < 2 ||
      nextCapacity > 4
    ) {
      return res.status(400).json({
        message: "Room capacity must be between 2 and 4."
      });
    }

    if (nextCapacity < room.students.length) {
      return res.status(400).json({
        message:
          "Capacity cannot be less than the number of students already assigned."
      });
    }

    if (
      !Number.isFinite(nextMonthlyFee) ||
      nextMonthlyFee < 0
    ) {
      return res.status(400).json({
        message: "Monthly fee must be zero or greater."
      });
    }

    room.roomNumber = nextRoomNumber;
    room.block = nextBlock;
    room.floor = nextFloor;
    room.capacity = nextCapacity;
    room.monthlyFee = nextMonthlyFee;

    await room.save();

    const newRoomLabel = roomLabel(room);

    // Update student labels only when they match this room's
    // previous label. Do not overwrite unrelated manual values.
    if (oldRoomLabel !== newRoomLabel) {
      await Student.updateMany(
        {
          _id: { $in: room.students },
          roomNumber: oldRoomLabel
        },
        {
          $set: {
            roomNumber: newRoomLabel
          }
        }
      );
    }

    return res.status(200).json({
      message: "Room updated successfully.",
      room
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This room number already exists in the selected block."
      });
    }

    console.error("Update room error:", error);

    return res.status(500).json({
      message: "Failed to update room."
    });
  }
};

// DELETE /api/rooms/:id
// Delete a room only when no students are assigned.
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid room ID."
      });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        message: "Room not found."
      });
    }

    if (room.students.length > 0) {
      return res.status(400).json({
        message:
          "Remove all student allocations before deleting this room."
      });
    }

    await room.deleteOne();

    return res.status(200).json({
      message: "Room deleted successfully."
    });
  } catch (error) {
    console.error("Delete room error:", error);

    return res.status(500).json({
      message: "Failed to delete room."
    });
  }
};

// POST /api/rooms/:id/allocate
// Request body: { "studentMongoId": "MongoDB student _id" }
export const allocateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentMongoId } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid room ID."
      });
    }

    if (!mongoose.isValidObjectId(studentMongoId)) {
      return res.status(400).json({
        message: "Please select a valid student."
      });
    }

    const room = await Room.findById(id);
    const student = await Student.findById(studentMongoId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found."
      });
    }

    if (!student) {
      return res.status(404).json({
        message: "Student not found."
      });
    }

    if (
      room.students.some(
        (studentId) => studentId.equals(student._id)
      )
    ) {
      return res.status(409).json({
        message: "This student is already assigned to this room."
      });
    }

    // Do not allow the same student in multiple managed rooms.
    const existingRoom = await Room.findOne({
      students: student._id
    });

    if (existingRoom) {
      return res.status(409).json({
        message: "This student is already assigned to another room."
      });
    }

    if (room.students.length >= room.capacity) {
      return res.status(400).json({
        message: "This room is full."
      });
    }

    // Require manually entered room details to be cleared first.
    if (student.roomNumber) {
      return res.status(409).json({
        message:
          "This student already has a room number. Clear it in Edit Student before allocating the student."
      });
    }

    room.students.push(student._id);
    student.roomNumber = roomLabel(room);

    await room.save();
    await student.save();

    return res.status(200).json({
      message: "Student allocated successfully."
    });
  } catch (error) {
    console.error("Allocate student error:", error);

    return res.status(500).json({
      message: "Failed to allocate student."
    });
  }
};

// DELETE /api/rooms/:id/students/:studentId
// Remove a student's room allocation.
export const removeStudentAllocation = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(studentId)
    ) {
      return res.status(400).json({
        message: "Invalid room or student ID."
      });
    }

    const room = await Room.findById(id);
    const student = await Student.findById(studentId);

    if (!room || !student) {
      return res.status(404).json({
        message: "Room or student not found."
      });
    }

    const isAssigned = room.students.some(
      (assignedId) => assignedId.equals(student._id)
    );

    if (!isAssigned) {
      return res.status(404).json({
        message: "This student is not assigned to this room."
      });
    }

    const assignedRoomLabel = roomLabel(room);

    room.students.pull(student._id);

    // Clear only the room label belonging to this room.
    if (student.roomNumber === assignedRoomLabel) {
      student.roomNumber = "";
    }

    await room.save();
    await student.save();

    return res.status(200).json({
      message: "Student removed from the room successfully."
    });
  } catch (error) {
    console.error("Remove student allocation error:", error);

    return res.status(500).json({
      message: "Failed to remove student allocation."
    });
  }
};