const mongoose = require("mongoose");

const sosEscalationSchema = new mongoose.Schema(
  {
    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyAlert",
      required: true,
    },

    contacts: [
      {
        name: String,
        phone: String,
        priority: Number,

        status: {
          type: String,
          enum: [
            "pending",
            "notified",
            "acknowledged",
            "skipped",
          ],
          default: "pending",
        },

        notifiedAt: Date,
        acknowledgedAt: Date,
      },
    ],

    currentContactIndex: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "waiting",
        "acknowledged",
        "escalating",
        "emergency-assistance-required",
        "resolved",
      ],
      default: "waiting",
    },

    escalationDelaySeconds: {
      type: Number,
      default: 20,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SOSEscalation",
  sosEscalationSchema
);