
import jwt from "jsonwebtoken";

// Verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether token is provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login first"
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables");

      return res.status(500).json({
        message: "Server authentication configuration error"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Store decoded user details
    req.user = decoded;

    next();

  } catch (error) {
    console.error("JWT verification error:", error.name, error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please login again."
      });
    }

    return res.status(401).json({
      message: "Invalid or expired token. Please login again."
    });
  }
};


// Check user role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: "Please login first"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. You do not have permission."
      });
    }

    next();
  };
};
