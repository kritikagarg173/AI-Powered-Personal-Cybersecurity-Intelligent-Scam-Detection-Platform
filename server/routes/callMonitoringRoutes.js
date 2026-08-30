console.log("🔥 CALL MONITORING ROUTES FILE LOADED");
const Notification = require("../models/Notification");
const protect = require("../middleware/authMiddleware");
const express = require("express");
const SecurityEvent = require("../models/SecurityEvent");
const User = require("../models/User");
const TrustedContact = require("../models/TrustedContact");
const router = express.Router();


// ======================================================
// SUSPICIOUS CALL PATTERNS
// ======================================================

const suspiciousPatterns = [
  {
    words: ["otp", "one time password", "verification code"],
    label: "OTP request",
    weight: 30,
  },
  {
    words: ["pin", "atm pin", "upi pin"],
    label: "PIN request",
    weight: 35,
  },
  {
    words: ["password", "login password"],
    label: "Password request",
    weight: 30,
  },
  {
    words: ["account blocked", "account will be blocked"],
    label: "Account threat",
    weight: 25,
  },
  {
    words: ["kyc", "update your kyc", "kyc verification"],
    label: "KYC request",
    weight: 18,
  },
  {
    words: ["urgent", "immediately", "right now"],
    label: "Urgency language",
    weight: 12,
  },
  {
    words: ["send money", "transfer money", "make a payment"],
    label: "Payment request",
    weight: 25,
  },
  {
    words: ["upi", "bank account", "credit card", "debit card"],
    label: "Financial information",
    weight: 20,
  },
  {
    words: ["remote access", "screen sharing", "anydesk"],
    label: "Remote access request",
    weight: 35,
  },
];

// ======================================================
// ANALYZE TRANSCRIPT
// POST /api/call-monitoring/analyze
// ======================================================

router.post("/analyze", protect, async (req, res) => {
  try {
    const {
  transcript,
  callerOrSender = "",
} = req.body;

const user = req.user.id;
    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        message: "Transcript is required",
      });
    }

    // -----------------------------
    // CHECK USER
    // -----------------------------

    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------
    // ANALYZE TEXT
    // -----------------------------

    const lowerText = transcript.toLowerCase();

    let riskScore = 8;
    const signals = [];

    suspiciousPatterns.forEach((pattern) => {
      const matched = pattern.words.some((word) =>
        lowerText.includes(word)
      );

      if (matched) {
        riskScore += pattern.weight;

        if (!signals.some((item) => item.label === pattern.label)) {
          signals.push({
            label: pattern.label,
            weight: pattern.weight,
          });
        }
      }
    });

    riskScore = Math.min(riskScore, 100);

    // -----------------------------
    // RISK LEVEL
    // -----------------------------

    let riskLevel = "LOW";
    let status = "RESOLVED";
    let recommendation =
      "No immediate action required. Continue monitoring the conversation.";

    if (riskScore >= 70) {
      riskLevel = "CRITICAL";
      status = "ESCALATED";

      recommendation =
        "Do not share OTPs, PINs, passwords or banking information. End the call and contact a trusted person.";
    } else if (riskScore >= 45) {
      riskLevel = "HIGH";
      status = "DETECTED";

      recommendation =
        "Be cautious. Do not share sensitive information or transfer money.";
    } else if (riskScore >= 25) {
      riskLevel = "MEDIUM";
      status = "DETECTED";

      recommendation =
        "Suspicious signals were detected. Avoid sharing personal or financial information.";
    }

    // -----------------------------
    // EXPLANATION
    // -----------------------------

    let explanation =
      "No significant scam indicators were detected in the conversation.";

    if (signals.length > 0) {
      explanation = `AI detected ${signals.length} suspicious conversation signal(s): ${signals
        .map((signal) => signal.label)
        .join(", ")}.`;
    }

    // -----------------------------
    // CREATE SECURITY EVENT
    // -----------------------------

    const event = await SecurityEvent.create({
      user,
      type: "SCAM_CALL",
      title:
        riskLevel === "CRITICAL"
          ? "Critical scam call detected"
          : riskLevel === "HIGH"
          ? "High-risk call detected"
          : "Call conversation analyzed",
      description: explanation,
      riskScore,
      riskLevel,
      status,
      metadata: {
        transcript,
        callerOrSender,
        signals,
        recommendation,
        source: "LIVE_CALL_MONITORING",
      },
    });
    if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
  await Notification.create({
    user,
    type: "threat",
    title:
      riskLevel === "CRITICAL"
        ? "Critical scam call detected"
        : "High-risk call detected",
    message: explanation,
    unread: true,
    source: "SCAM_CALL",
    securityEvent: event._id,
  });
}

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(200).json({
      success: true,
      message: "Call conversation analyzed successfully",

      analysis: {
        riskScore,
        riskLevel,
        signals,
        transcript,
        callerOrSender,
        explanation,
        recommendation,
      },

      event: {
        id: event._id,
        type: event.type,
        status: event.status,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    console.error("Call monitoring error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze call conversation",
      error: error.message,
    });
  }
});
// ======================================================
// ALERT TRUSTED CONTACT
// POST /api/call-monitoring/guardian-alert
// ======================================================
router.post("/guardian-alert", protect, async (req, res) => {
  try {
    const {
  riskScore = 0,
  riskLevel = "HIGH",
  transcript = "",
  callerOrSender = "",
} = req.body;

const user = req.user.id;

    
    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // First try primary trusted contact
    let contact = await TrustedContact.findOne({
      user,
      isPrimary: true,
    });

    // If no primary contact, use highest priority contact
    if (!contact) {
      contact = await TrustedContact.findOne({
        user,
      }).sort({
        priority: 1,
        createdAt: 1,
      });
    }

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "No trusted contact found for this user",
      });
    }

    const event = await SecurityEvent.create({
      user,
      type: "GUARDIAN_ALERT",
      title: "Trusted contact alerted",
      description:
        "A trusted contact was alerted because suspicious activity was detected during a monitored call.",
      riskScore,
      riskLevel,
      status: "ESCALATED",
      metadata: {
        transcript,
        callerOrSender,

        guardianId: contact._id,
        guardianName: contact.name,
        guardianPhone: contact.phone,
        guardianRelationship: contact.relationship,

        source: "LIVE_CALL_MONITORING",
        action: "GUARDIAN_ALERT",
      },
    });
    await Notification.create({
  user,
  type: "protection",
  title: "Trusted contact alerted",
  message: `${contact.name} (${contact.relationship}) was notified about the suspicious call.`,
  unread: true,
  source: "GUARDIAN_ALERT",
  securityEvent: event._id,
});

    return res.status(201).json({
      success: true,
      message: "Trusted contact alert created successfully",

      guardian: {
        id: contact._id,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
        isPrimary: contact.isPrimary,
      },

      event: {
        id: event._id,
        type: event.type,
        status: event.status,
        riskScore: event.riskScore,
        riskLevel: event.riskLevel,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    console.error("Guardian alert error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create guardian alert",
      error: error.message,
    });
  }
});

// ======================================================
// ACTIVATE SOS
// POST /api/call-monitoring/sos
// ======================================================

router.post("/sos", protect, async (req, res) => {
  try {
    const {
  riskScore = 0,
  riskLevel = "CRITICAL",
  transcript = "",
  callerOrSender = "",
} = req.body;

const user = req.user.id;

    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const event = await SecurityEvent.create({
      user,
      type: "SOS",
      title: "Emergency SOS activated",
      description:
        "Emergency SOS was activated during a monitored call.",
      riskScore,
      riskLevel,
      status: "ESCALATED",
      metadata: {
        transcript,
        callerOrSender,
        source: "LIVE_CALL_MONITORING",
        action: "SOS",
      },
    });
    await Notification.create({
  user,
  type: "threat",
  title: "Emergency SOS activated",
  message:
    "Emergency SOS was activated during a monitored call.",
  unread: true,
  source: "SOS",
  securityEvent: event._id,
});

    return res.status(201).json({
      success: true,
      message: "Emergency SOS event created successfully",
      event: {
        id: event._id,
        type: event.type,
        status: event.status,
        riskScore: event.riskScore,
        riskLevel: event.riskLevel,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    console.error("SOS error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to activate SOS",
      error: error.message,
    });
  }
});

module.exports = router;