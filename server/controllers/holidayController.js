import Holiday from "../models/Holiday.js";

// Get all holidays
export const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });

    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Add holiday
export const createHoliday = async (req, res) => {
  try {
    const { name, date, description, category } = req.body;

    if (!name || !date) {
      return res.status(400).json({
        message: "Holiday name and date are required",
      });
    }

    const holidayDate = new Date(`${date}T00:00:00.000Z`);

    if (Number.isNaN(holidayDate.getTime())) {
      return res.status(400).json({
        message: "Invalid holiday date",
      });
    }

    const holiday = await Holiday.create({
      name,
      date: holidayDate,
      description,
      category,
    });

    res.status(201).json({
      message: "Holiday added successfully",
      holiday,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update holiday
export const updateHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!holiday) {
      return res.status(404).json({
        message: "Holiday not found",
      });
    }

    res.status(200).json({
      message: "Holiday updated successfully",
      holiday,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete holiday
export const deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(
      req.params.id
    );

    if (!holiday) {
      return res.status(404).json({
        message: "Holiday not found",
      });
    }

    res.status(200).json({
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};