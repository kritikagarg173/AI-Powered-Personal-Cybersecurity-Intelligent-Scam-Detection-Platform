const connectDB = require("./config/db");
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
const emergencyEvidenceRoutes = require("./routes/emergencyEvidenceRoutes");
const elderlyModeRoutes = require("./routes/elderlyModeRoutes");

dotenv.config();

const app = express();

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost",
  "https://localhost",
  "capacitor://localhost",
  "https://cyber-shield-mobile.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin header
    // e.g. Postman, mobile/native requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

// ==========================================
// BODY PARSERS
// ==========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);
// ==========================================
// DATABASE CONNECTION
// ==========================================

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});
// ==========================================
// ROUTES
// ==========================================

app.use("/api/screenshot", screenshotRoutes);

app.use(
  "/api/call-monitoring",
  callMonitoringRoutes
);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/contacts", contactRoutes);

app.use(
  "/api/security-events",
  securityEventRoutes
);

app.use(
  "/api/link-scanner",
  linkScannerRoutes
);

app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);

app.use(
  "/api/caller-verification",
  callerVerificationRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/sos-escalation",
  sosEscalationRoutes
);

app.use(
  "/api/emergency-evidence",
  emergencyEvidenceRoutes
);

app.use("/api/elderly", elderlyModeRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================

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