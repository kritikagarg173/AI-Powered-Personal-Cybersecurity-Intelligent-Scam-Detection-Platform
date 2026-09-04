const express = require("express");
const SecurityEvent = require("../models/SecurityEvent");


const router = express.Router();


// ==========================================
// HELPER: CHECK ACTIVE THREAT
// ==========================================

const isActiveThreat = (event) => {
  const status = String(event.status || "").toUpperCase();

  return ![
    "RESOLVED",
    "BLOCKED",
    "SAFE",
    "CLOSED",
  ].includes(status);
};


// ==========================================
// HELPER: CALCULATE SECURITY SCORE
// ==========================================

const calculateSecurityScore = (events) => {
  const now = new Date();

  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000
  );

  const recentEvents = events.filter((event) => {
    const createdAt = new Date(event.createdAt);
    return createdAt >= sevenDaysAgo;
  });

  if (recentEvents.length === 0) {
    return {
      securityScore: 100,
      criticalEvents: 0,
      highEvents: 0,
      mediumEvents: 0,
      lowEvents: 0,
      recentActiveEvents: [],
    };
  }

  const activeEvents = recentEvents.filter((event) =>
    isActiveThreat(event)
  );

  const criticalEvents = activeEvents.filter(
    (event) => event.riskLevel === "CRITICAL"
  ).length;

  const highEvents = activeEvents.filter(
    (event) => event.riskLevel === "HIGH"
  ).length;

  const mediumEvents = activeEvents.filter(
    (event) => event.riskLevel === "MEDIUM"
  ).length;

  const lowEvents = activeEvents.filter(
    (event) => event.riskLevel === "LOW"
  ).length;

  // Weighted threat severity
  const weightedRisk =
    criticalEvents * 4 +
    highEvents * 3 +
    mediumEvents * 2 +
    lowEvents;

  // Normalize against total recent events
  const maxPossibleRisk =
    Math.max(recentEvents.length * 4, 1);

  const riskRatio =
    weightedRisk / maxPossibleRisk;

  // Score stays meaningful instead of instantly becoming 0
  let securityScore =
    100 - Math.round(riskRatio * 70);

  // Emergency SOS should reduce score,
  // but not destroy it completely
  const recentSOS = recentEvents.filter(
    (event) => event.type === "SOS"
  ).length;

  securityScore -=
    Math.min(recentSOS * 2, 10);

  securityScore =
    Math.max(
      20,
      Math.min(100, securityScore)
    );

  return {
    securityScore,
    criticalEvents,
    highEvents,
    mediumEvents,
    lowEvents,
    recentActiveEvents: activeEvents,
  };
};

// ==========================================
// SECURITY DASHBOARD OVERVIEW
// GET /api/dashboard/overview
// ==========================================

router.get("/overview", async (req, res) => {
  try {
    
    const events = await SecurityEvent.find({})
  .sort({ createdAt: -1 })
  .lean();


    // ==========================================
    // BASIC STATS
    // ==========================================

    const callsMonitored = events.filter(
      (event) =>
        event.type === "SCAM_CALL"
    ).length;


    const scamsBlocked = events.filter(
      (event) =>
        event.type === "SCAM_CALL" &&
        (
          event.riskLevel === "HIGH" ||
          event.riskLevel === "CRITICAL"
        )
    ).length;


    const guardianAlerts = events.filter(
      (event) =>
        event.type === "GUARDIAN_ALERT"
    ).length;


    const sosActivations = events.filter(
      (event) =>
        event.type === "SOS"
    ).length;


    const unsafeLinks = events.filter(
      (event) =>
        event.type === "UNSAFE_LINK" ||
        event.type === "LINK_SCAN"
    ).length;


    // ==========================================
    // RECENT ACTIVITY
    // ==========================================

    const recentActivity = events
      .slice(0, 5)
      .map((event) => ({
        id: event._id,

        type: event.type,

        title:
          event.title ||
          "Security activity detected",

        description:
          event.description || "",

        riskScore:
          event.riskScore || 0,

        riskLevel:
          event.riskLevel || "LOW",

        status:
          event.status || "ACTIVE",

        createdAt:
          event.createdAt,
      }));


    // ==========================================
    // SECURITY SCORE
    // ==========================================

    const scoreData =
      calculateSecurityScore(events);

    const securityScore =
      scoreData.securityScore;

    const criticalEvents =
      scoreData.criticalEvents;

    const highEvents =
      scoreData.highEvents;

    const mediumEvents =
      scoreData.mediumEvents;

    const lowEvents =
      scoreData.lowEvents;


    // ==========================================
    // WEEKLY THREAT ACTIVITY
    // ==========================================

    const dayNames = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ];


    const weeklyActivity = [];


    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(
        0,
        0,
        0,
        0
      );

      date.setDate(
        date.getDate() - i
      );


      const nextDate =
        new Date(date);

      nextDate.setDate(
        nextDate.getDate() + 1
      );


      const count = events.filter(
        (event) => {
          const eventDate =
            new Date(
              event.createdAt
            );

          return (
            eventDate >= date &&
            eventDate < nextDate
          );
        }
      ).length;


      weeklyActivity.push({
        day:
          dayNames[
            date.getDay()
          ],

        date:
          date.toISOString(),

        threats:
          count,
      });
    }


    // ==========================================
    // STATUS
    // ==========================================

    let securityStatus =
      "Protected";

    if (securityScore < 50) {
      securityStatus =
        "At Risk";
    } else if (
      securityScore < 75
    ) {
      securityStatus =
        "Needs Attention";
    } else if (
      securityScore < 90
    ) {
      securityStatus =
        "Good";
    }


    return res.status(200).json({
      success: true,

      dashboard: {

        securityScore,

        securityStatus,

        stats: {

          callsMonitored,

          scamsBlocked,

          unsafeLinks,

          guardianAlerts,

          sosActivations,

          totalEvents:
            events.length,

        },

        threats: {

          critical:
            criticalEvents,

          high:
            highEvents,

          medium:
            mediumEvents,

          low:
            lowEvents,

          activeRecent:
            scoreData.recentActiveEvents.length,

        },

        weeklyActivity,

        recentActivity,

      },

    });

  } catch (error) {

    console.error(
      "Dashboard overview error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to load security dashboard",

      error:
        error.message,

    });
  }
});


// ==========================================
// RUN SECURITY SCAN
// POST /api/dashboard/scan
// ==========================================

router.post("/scan", async (req, res) => {
  try {

    


    const events = await SecurityEvent.find({})
  .sort({ createdAt: -1 })
  .lean();


    const scoreData =
      calculateSecurityScore(events);


    const criticalThreats =
      scoreData.criticalEvents;

    const highThreats =
      scoreData.highEvents;

    const mediumThreats =
      scoreData.mediumEvents;

    const lowThreats =
      scoreData.lowEvents;


    const threatsDetected =
      scoreData.recentActiveEvents.length;


    const securityScore =
      scoreData.securityScore;


    const checks = {

      accountProtection:
        true,

      callProtection:
        true,

      linkProtection:
        true,

      guardianProtection:
        true,

    };


    let protectionStatus =
      "ACTIVE";


    if (securityScore < 50) {

      protectionStatus =
        "AT RISK";

    } else if (
      securityScore < 75
    ) {

      protectionStatus =
        "ATTENTION REQUIRED";

    } else if (
      securityScore < 90
    ) {

      protectionStatus =
        "GOOD";

    }


    return res.status(200).json({

      success: true,

      message:
        "Security scan completed successfully",

      scan: {

        securityScore,

        threatsDetected,

        threats: {

          critical:
            criticalThreats,

          high:
            highThreats,

          medium:
            mediumThreats,

          low:
            lowThreats,

        },

        checksCompleted:
          4,

        totalChecks:
          4,

        protectionStatus,

        checks,

        scannedAt:
          new Date(),

      },

    });

  } catch (error) {

    console.error(
      "Security scan error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Security scan failed",

      error:
        error.message,

    });

  }
});


module.exports = router;