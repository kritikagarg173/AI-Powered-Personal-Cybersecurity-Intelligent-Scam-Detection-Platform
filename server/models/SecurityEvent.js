const mongoose = require("mongoose");

const securityEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "LINK_SCAN",
        "SCAM_CALL",
        "CALLER_VERIFICATION",
        "SCREENSHOT_ANALYSIS",
        "EVIDENCE_CAPTURE",
        "GUARDIAN_ALERT",
        "SOS",
      ],
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },

    status: {
      type: String,
      enum: [
        "DETECTED",
        "BLOCKED",
        "RESOLVED",
        "ESCALATED",
      ],
      default: "DETECTED",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SecurityEvent",
  securityEventSchema
);