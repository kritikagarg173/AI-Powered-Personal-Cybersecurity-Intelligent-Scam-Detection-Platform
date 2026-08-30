const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["threat", "protection", "ai"],
      default: "protection",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    unread: {
      type: Boolean,
      default: true,
    },

    source: {
      type: String,
      enum: [
        "LINK_SCAN",
        "SCAM_CALL",
        "CALLER_VERIFICATION",
        "SCREENSHOT_ANALYSIS",
        "GUARDIAN_ALERT",
        "SOS",
        "SECURITY_SCAN",
        "SYSTEM",
      ],
      default: "SYSTEM",
    },

    securityEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SecurityEvent",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);