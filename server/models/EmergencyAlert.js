const mongoose = require("mongoose");

const emergencyAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    type: {
      type: String,
      enum: [
        "SOS",
        "SCAM_ALERT",
        "CALL_ALERT",
        "FRAUD_ALERT",
        "MANUAL"
      ],
      default: "SOS",
    },

    status: {
      type: String,
      enum: [
        "active",
        "acknowledged",
        "resolved"
      ],
      default: "active",
    },

    message: {
      type: String,
      default: "Emergency assistance requested",
    },

    location: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    notifiedContacts: [
      {
        name: String,
        phone: String,
      },
    ],

    source: {
      type: String,
      default: "elderly-mode",
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "EmergencyAlert",
  emergencyAlertSchema
);