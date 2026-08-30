const mongoose = require("mongoose");

const trustedContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    relationship: {
      type: String,
      trim: true,
      default: "Trusted Contact",
    },

    priority: {
      type: Number,
      default: 1,
      min: 1,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "TrustedContact",
  trustedContactSchema
);