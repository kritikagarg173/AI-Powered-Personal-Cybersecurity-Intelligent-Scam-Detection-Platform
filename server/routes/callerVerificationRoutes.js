const express = require("express");
const SecurityEvent = require("../models/SecurityEvent");
const User = require("../models/User");

const router = express.Router();

// ======================================================
// VERIFY CALLER
// POST /api/caller-verification/verify
// ======================================================

router.post("/verify", async (req, res) => {
  try {
    const { user, phone } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove spaces, +, -, brackets etc.
    const digits = phone.replace(/\D/g, "");

    // -----------------------------
    // BASIC RISK ANALYSIS
    // -----------------------------

    let riskPoints = 0;
    const signals = [];

    if (digits.length < 10) {
      riskPoints += 60;
      signals.push("Invalid or unusually short phone number");
    }

    if (digits.includes("0000")) {
      riskPoints += 45;
      signals.push("Suspicious repeated zero pattern");
    }

    if (/(\d)\1{5,}/.test(digits)) {
      riskPoints += 35;
      signals.push("Unusual repeated digit pattern");
    }

    if (digits.length > 15) {
      riskPoints += 50;
      signals.push("Invalid phone number length");
    }

    riskPoints = Math.min(riskPoints, 100);

    // Safety score: higher = safer
    const score = Math.max(0, 100 - riskPoints);

    let safe = true;
    let status = "LOW RISK";
    let name = "Verified Contact";
    let description =
      "This number appears to have a low-risk profile based on the available verification signals.";

    if (riskPoints >= 50) {
      safe = false;
      status = "HIGH RISK";
      name = "Unknown Caller";
      description =
        "This number could not be reliably verified and may require additional caution.";
    } else if (riskPoints >= 25) {
      safe = false;
      status = "MEDIUM RISK";
      name = "Unverified Caller";
      description =
        "Some suspicious characteristics were detected. Verify the caller independently before sharing information.";
    }

    // -----------------------------
    // SAVE SECURITY EVENT
    // -----------------------------

    const event = await SecurityEvent.create({
      user,
      type: "CALLER_VERIFICATION",
      title:
        status === "HIGH RISK"
          ? "High-risk caller detected"
          : "Caller verification completed",
      description,
      riskScore: riskPoints,
      riskLevel:
        status === "HIGH RISK"
          ? "HIGH"
          : status === "MEDIUM RISK"
          ? "MEDIUM"
          : "LOW",
      status: safe ? "RESOLVED" : "DETECTED",
      metadata: {
        phone,
        signals,
        safetyScore: score,
        source: "CALLER_VERIFICATION",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Caller verification completed",

      result: {
        safe,
        score,
        status,
        name,
        description,
        phone,
        signals,
      },

      event: {
        id: event._id,
        type: event.type,
        status: event.status,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    console.error("Caller verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify caller",
      error: error.message,
    });
  }
});

module.exports = router;