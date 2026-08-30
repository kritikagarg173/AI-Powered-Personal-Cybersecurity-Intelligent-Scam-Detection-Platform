const express = require("express");

const {
  getElderlyModeStatus,
  updateElderlyModeSettings,
  createSOSAlert,
  getEmergencyAlerts,
  resolveEmergencyAlert,
} = require("../controllers/elderlyModeController");

const router = express.Router();


// ==========================================
// GET ELDERLY MODE STATUS
// ==========================================

router.get(
  "/status",
  getElderlyModeStatus
);


// ==========================================
// UPDATE ELDERLY MODE SETTINGS
// ==========================================

router.put(
  "/settings",
  updateElderlyModeSettings
);


// ==========================================
// CREATE SOS ALERT
// ==========================================

router.post(
  "/sos",
  createSOSAlert
);


// ==========================================
// GET EMERGENCY ALERTS
// ==========================================

router.get(
  "/alerts",
  getEmergencyAlerts
);


// ==========================================
// RESOLVE EMERGENCY ALERT
// ==========================================

router.put(
  "/alerts/:id/resolve",
  resolveEmergencyAlert
);


module.exports = router;