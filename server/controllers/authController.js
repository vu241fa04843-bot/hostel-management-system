
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// STUDENT REGISTRATION
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      registrationNumber,
      branch,
      yearOfStudy
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !registrationNumber ||
      !branch ||
      !yearOfStudy
    ) {
      return res.status(400).json({
        message: "Please provide all student details"
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    // Validate year
    const validYears = [
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year"
    ];

    if (!validYears.includes(yearOfStudy)) {
      return res.status(400).json({
        message: "Invalid year of study"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRegNo = registrationNumber.trim();

    // Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Check existing registration number
    const existingRegNo = await User.findOne({
      registrationNumber: normalizedRegNo
    });

    if (existingRegNo) {
      return res.status(409).json({
        message: "Registration number already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Public registration creates Student accounts only
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      registrationNumber: normalizedRegNo,
      branch: branch.trim(),
      yearOfStudy,
      role: "Student"
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registrationNumber: user.registrationNumber,
        branch: user.branch,
        yearOfStudy: user.yearOfStudy,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed"
    });
  }
};


// USER LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT secret is missing"
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registrationNumber: user.registrationNumber,
        branch: user.branch,
        yearOfStudy: user.yearOfStudy,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed"
    });
  }
};
