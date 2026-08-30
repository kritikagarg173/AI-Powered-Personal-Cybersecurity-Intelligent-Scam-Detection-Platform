const mongoose = require("mongoose");

const emergencyEvidenceSchema =
  new mongoose.Schema(
    {
      alertId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "EmergencyAlert",

        required: true,
      },

      incidentType: {
        type: String,

        default: "SOS",
      },

      callerNumber: {
        type: String,

        default: "",
      },

      suspiciousKeywords: {
        type: [String],

        default: [],
      },

      screenshotUrl: {
        type: String,

        default: "",
      },

      riskScore: {
        type: Number,

        min: 0,

        max: 100,

        default: 0,
      },

      location: {
        latitude: Number,
        longitude: Number,
      },

      notes: {
        type: String,

        default: "",
      },

      generatedAt: {
        type: Date,

        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "EmergencyEvidence",
    emergencyEvidenceSchema
  );