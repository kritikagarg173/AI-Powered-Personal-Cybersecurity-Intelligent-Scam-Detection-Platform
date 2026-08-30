const express = require("express");

const {
  createEvidencePack,
  getEvidencePack,
} = require("../controllers/emergencyEvidenceController");

const router = express.Router();

router.post(
  "/",
  createEvidencePack
);

router.get(
  "/:alertId",
  getEvidencePack
);

module.exports = router;