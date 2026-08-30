const express = require("express");
const User = require("../models/User");

const router = express.Router();

// =========================
// TEST USER
// =========================

router.post("/test-user", async (req, res) => {
  try {
    const existingUser = await User.findOne({
      email: "demo@cybershield.ai",
    });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "Test user already exists",
        user: existingUser,
      });
    }

    const user = await User.create({
      name: "Cyber Shield Demo User",
      email: "demo@cybershield.ai",
      phone: "9999999999",
      password: "demo123456",
    });

    res.status(201).json({
      success: true,
      message: "Test user created successfully",
      user,
    });
  } catch (error) {
    console.error("Test user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create test user",
      error: error.message,
    });
  }
});

module.exports = router;