const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  analyzeScreenshot,
} = require("../controllers/screenshotController");

const router = express.Router();

// POST /api/screenshot/analyze
router.post(
  "/analyze",
  upload.single("screenshot"),
  analyzeScreenshot
);

module.exports = router;