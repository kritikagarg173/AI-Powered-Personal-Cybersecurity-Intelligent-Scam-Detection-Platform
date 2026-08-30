const express = require("express");
const SecurityEvent = require("../models/SecurityEvent");

const router = express.Router();

// ==========================================
// CREATE SECURITY EVENT
// POST /api/security-events
// ==========================================

router.post("/", async (req, res) => {
  try {
    const {
      user,
      type,
      title,
      description,
      riskScore,
      riskLevel,
      status,
      metadata,
    } = req.body;

    const event = await SecurityEvent.create({
      user,
      type,
      title,
      description,
      riskScore,
      riskLevel,
      status,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: "Security event created successfully",
      event,
    });
  } catch (error) {
    console.error("Security event error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create security event",
      error: error.message,
    });
  }
});


// ==========================================
// SECURITY DASHBOARD STATISTICS
// GET /api/security-events/stats
// ==========================================

router.get("/stats", async (req, res) => {
  try {
    const totalEvents = await SecurityEvent.countDocuments();

    const blockedEvents = await SecurityEvent.countDocuments({
      status: "BLOCKED",
    });

    const highRiskEvents = await SecurityEvent.countDocuments({
      riskLevel: {
        $in: ["HIGH", "CRITICAL"],
      },
    });

    const linkScans = await SecurityEvent.countDocuments({
      type: "LINK_SCAN",
    });

    const scamCalls = await SecurityEvent.countDocuments({
      type: "SCAM_CALL",
    });

    const sosEvents = await SecurityEvent.countDocuments({
      type: "SOS",
    });

    res.status(200).json({
      success: true,
      statistics: {
        totalEvents,
        blockedEvents,
        highRiskEvents,
        linkScans,
        scamCalls,
        sosEvents,
      },
    });
  } catch (error) {
    console.error("Security statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch security statistics",
      error: error.message,
    });
  }
});


// ==========================================
// GET ALL SECURITY EVENTS
// GET /api/security-events
// ==========================================

router.get("/", async (req, res) => {
  try {
    const events = await SecurityEvent.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Fetch security events error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch security events",
      error: error.message,
    });
  }
});


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;