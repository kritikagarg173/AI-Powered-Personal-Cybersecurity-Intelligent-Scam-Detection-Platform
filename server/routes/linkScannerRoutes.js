const express = require("express");
const { scanLink } = require("../controllers/linkScannerController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/scan", protect, scanLink);

module.exports = router;