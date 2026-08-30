const mongoose = require("mongoose");

const elderlyModeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    elderlyModeEnabled: {
      type: Boolean,
      default: true,
    },

    aiGuardianEnabled: {
      type: Boolean,
      default: true,
    },

    scamProtection: {
      type: Boolean,
      default: true,
    },

    callProtection: {
      type: Boolean,
      default: true,
    },

    fraudAlerts: {
      type: Boolean,
      default: true,
    },

    protectionScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },

    activeThreats: {
      type: Number,
      default: 0,
    },

    lastSafetyCheck: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ElderlyMode",
  elderlyModeSchema
);