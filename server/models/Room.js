
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },

    block: {
      type: String,
      required: true,
      trim: true
    },

    floor: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    capacity: {
      type: Number,
      required: true,
      min: 2,
      max: 4,
      validate: {
        validator: Number.isInteger,
        message: "Capacity must be a whole number."
      }
    },

    monthlyFee: {
      type: Number,
      required: true,
      min: 0
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
      }
    ]
  },
  { timestamps: true }
);

// Room numbers must be unique within each block.
roomSchema.index(
  { block: 1, roomNumber: 1 },
  { unique: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;