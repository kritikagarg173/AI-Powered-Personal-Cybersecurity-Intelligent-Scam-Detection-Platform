const SecurityEvent = require("../models/SecurityEvent");
const Notification = require("../models/Notification");

const scanLink = async (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL",
      });
    }

    // Basic security checks
    let riskScore = 10;
    let riskLevel = "LOW";
    let status = "DETECTED";
    let threats = [];

    const hostname = parsedUrl.hostname.toLowerCase();

    // HTTP instead of HTTPS
    if (parsedUrl.protocol === "http:") {
      riskScore += 20;
      threats.push("Website does not use HTTPS");
    }

    // Suspicious keywords
    const suspiciousKeywords = [
      "login",
      "verify",
      "verification",
      "secure",
      "account",
      "password",
      "bank",
      "payment",
      "wallet",
      "free",
      "prize",
      "winner",
    ];

    const matchedKeywords = suspiciousKeywords.filter((keyword) =>
      url.toLowerCase().includes(keyword)
    );

    if (matchedKeywords.length > 0) {
      riskScore += matchedKeywords.length * 8;

      threats.push(
        `Suspicious keywords detected: ${matchedKeywords.join(", ")}`
      );
    }

    // Suspicious URL patterns
    if (
      hostname.includes("-") ||
      hostname.split(".").length > 3 ||
      url.includes("@")
    ) {
      riskScore += 20;
      threats.push("Suspicious URL structure detected");
    }

    // Cap score
    if (riskScore > 100) {
      riskScore = 100;
    }

    // Determine risk level
    if (riskScore >= 75) {
      riskLevel = "CRITICAL";
      status = "BLOCKED";
    } else if (riskScore >= 50) {
      riskLevel = "HIGH";
    } else if (riskScore >= 25) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "LOW";
    }

    // Save security event only if user is available
    let securityEvent = null;

    if (req.user && req.user.id) {
      securityEvent = await SecurityEvent.create({
        user: req.user.id,
        type: "LINK_SCAN",
        title:
          riskLevel === "LOW"
            ? "Safe Link Scanned"
            : "Suspicious Link Detected",
        description:
          threats.length > 0
            ? threats.join(". ")
            : "No major security threats detected.",
        riskScore,
        riskLevel,
        status,
        metadata: {
          url,
          hostname,
          protocol: parsedUrl.protocol,
          threats,
        },
      });
    }
    // Create notification only for suspicious links
if (
  req.user &&
  req.user.id &&
  securityEvent &&
  (riskLevel === "MEDIUM" ||
    riskLevel === "HIGH" ||
    riskLevel === "CRITICAL")
) {
  await Notification.create({
    user: req.user.id,
    type: "threat",
    title: "Suspicious link detected",
    message:
      threats.length > 0
        ? threats.join(". ")
        : "A potentially unsafe link was detected.",
    unread: true,
    source: "LINK_SCAN",
    securityEvent: securityEvent._id,
  });
}

    return res.status(200).json({
      success: true,
      message:
        riskLevel === "LOW"
          ? "Link appears to be safe"
          : "Potentially unsafe link detected",

      result: {
        url,
        hostname,
        riskScore,
        riskLevel,
        status,
        threats,
        safe: riskLevel === "LOW",
      },

      securityEvent,
    });
  } catch (error) {
    console.error("Link scanner error:", error);

    return res.status(500).json({
      success: false,
      message: "Link scanning failed",
      error: error.message,
    });
  }
};

module.exports = {
  scanLink,
};