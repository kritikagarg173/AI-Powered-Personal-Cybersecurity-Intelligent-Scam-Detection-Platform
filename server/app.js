const screenshotRoutes = require("./routes/screenshotRoutes");
const express = require("express");
const cors = require("cors");
const sosEscalationRoutes = require("./routes/sosEscalationRoutes");
const dotenv = require("dotenv");

const callMonitoringRoutes = require("./routes/callMonitoringRoutes");
const callerVerificationRoutes = require("./routes/callerVerificationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const securityEventRoutes = require("./routes/securityEventRoutes");
const linkScannerRoutes = require("./routes/linkScannerRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const emergencyEvidenceRoutes =
  require("./routes/emergencyEvidenceRoutes");

// ==========================================
// ELDERLY MODE ROUTES
// ==========================================
const elderlyModeRoutes = require("./routes/elderlyModeRoutes");

dotenv.config();

const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost",
      "capacitor://localhost",
    ],
    credentials: true,
  })
);

// IMPORTANT: Body parser MUST come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/screenshot", screenshotRoutes);
app.use("/api/call-monitoring", callMonitoringRoutes);


// =========================
// ROUTES
// =========================

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/security-events", securityEventRoutes);
app.use("/api/link-scanner", linkScannerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/caller-verification", callerVerificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(
  "/api/sos-escalation",
  sosEscalationRoutes
);
app.use(
  "/api/emergency-evidence",
  emergencyEvidenceRoutes
);

// ==========================================
// ELDERLY MODE
// ==========================================

app.use("/api/elderly", elderlyModeRoutes);


// =========================
// HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cyber Shield AI Backend is running 🚀",
    status: "online",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Cyber Shield AI API is healthy",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;