
import mongoose from "mongoose";
import MessMenu from "../models/MessMenu.js";

const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];

function parseDate(value) {
  if (typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function getMenus(req, res) {
  try {
    const menus = await MessMenu.find().sort({ date: -1, mealType: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: "Could not load menus." });
  }
}

export async function createMenu(req, res) {
  try {
    const { date, mealType, items, price, notes = "" } = req.body;
    const parsedDate = parseDate(date);

    if (!parsedDate || !mealTypes.includes(mealType) ||
        typeof items !== "string" || !items.trim() ||
        !Number.isFinite(Number(price)) || Number(price) < 0 ||
        typeof notes !== "string") {
      return res.status(400).json({
        message: "Enter a valid date, meal type, menu, and price.",
      });
    }

    const menu = await MessMenu.create({
      date: parsedDate,
      mealType,
      items: items.trim(),
      price: Number(price),
      notes: notes.trim(),
    });

    res.status(201).json(menu);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A menu already exists for this meal and date.",
      });
    }
    res.status(500).json({ message: "Could not create menu." });
  }
}

export async function updateMenu(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid menu ID." });
    }

    const { date, mealType, items, price, notes } = req.body;
    const update = {};

    if (date !== undefined) {
      update.date = parseDate(date);
      if (!update.date) {
        return res.status(400).json({ message: "Invalid date." });
      }
    }

    if (mealType !== undefined) {
      if (!mealTypes.includes(mealType)) {
        return res.status(400).json({ message: "Invalid meal type." });
      }
      update.mealType = mealType;
    }

    if (items !== undefined) {
      if (typeof items !== "string" || !items.trim()) {
        return res.status(400).json({ message: "Menu items are required." });
      }
      update.items = items.trim();
    }

    if (price !== undefined) {
      if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ message: "Invalid price." });
      }
      update.price = Number(price);
    }

    if (notes !== undefined) {
      if (typeof notes !== "string") {
        return res.status(400).json({ message: "Invalid notes." });
      }
      update.notes = notes.trim();
    }

    const menu = await MessMenu.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }

    res.json(menu);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A menu already exists for this meal and date.",
      });
    }
    res.status(500).json({ message: "Could not update menu." });
  }
}

export async function deleteMenu(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid menu ID." });
    }

    const menu = await MessMenu.findByIdAndDelete(req.params.id);

    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }

    res.json({ message: "Menu deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete menu." });
  }
}