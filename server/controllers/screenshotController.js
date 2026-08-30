const fs = require("fs");
const User = require("../models/User");
const SecurityEvent = require("../models/SecurityEvent");

const analyzeScreenshot = async (req, res) => {
  let uploadedFilePath = null;

  try {
    // ==========================================
    // CHECK SCREENSHOT
    // ==========================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Screenshot image is required",
      });
    }

    uploadedFilePath = req.file.path;

    // ==========================================
    // CHECK USER
    // ==========================================

    const userId = req.body.user;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // CHECK GEMINI KEY
    // ==========================================

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing in .env",
      });
    }

    // ==========================================
    // READ IMAGE
    // ==========================================

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    // ==========================================
    // AI PROMPT
    // ==========================================

    const prompt = `
You are Cyber Shield AI, a cybersecurity screenshot analyzer.

Analyze this screenshot carefully for signs of:

1. Phishing
2. Scam messages
3. Fake account verification
4. OTP requests
5. Password requests
6. Banking/payment fraud
7. UPI fraud
8. Fake customer support
9. Account suspension threats
10. Impersonation
11. Suspicious URLs
12. Social engineering
13. Prize/winner scams
14. Refund scams
15. Urgent requests for sensitive information

IMPORTANT:
- Only identify information actually visible in the screenshot.
- Do not invent phone numbers, URLs, names or messages.
- If the screenshot is harmless, say so.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not wrap the JSON in backticks.

Return exactly this structure:

{
  "riskScore": 0,
  "riskLevel": "LOW",
  "signals": [],
  "suspiciousText": "",
  "callerOrSender": "",
  "explanation": "",
  "recommendation": ""
}

Rules:

riskScore:
0-29 = LOW
30-59 = MEDIUM
60-79 = HIGH
80-100 = CRITICAL

riskLevel must be exactly:
LOW
MEDIUM
HIGH
CRITICAL

signals must be an array of short strings.

suspiciousText should contain the important suspicious text visible in the screenshot.

callerOrSender should contain a visible phone number, email, username or sender name if present. Otherwise return an empty string.

explanation should briefly explain why the screenshot is risky or safe.

recommendation should tell the user what they should do next.
`;

    // ==========================================
    // CALL GEMINI
    // ==========================================

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: req.file.mimetype,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    const geminiData = await geminiResponse.json();

    // ==========================================
    // GEMINI ERROR
    // ==========================================

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", geminiData);

      return res.status(500).json({
        success: false,
        message: "Gemini AI analysis failed",
        error:
          geminiData?.error?.message ||
          "Unknown Gemini API error",
      });
    }

    // ==========================================
    // GET AI RESPONSE
    // ==========================================

    const aiText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.status(500).json({
        success: false,
        message: "Gemini returned an empty response",
      });
    }

    // ==========================================
    // CLEAN AI JSON
    // ==========================================

    let cleanedText = aiText.trim();

    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();
    }

    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();
    }

    let analysis;

    try {
      analysis = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Invalid AI JSON:", aiText);

      return res.status(500).json({
        success: false,
        message: "Gemini returned invalid JSON",
        rawAnalysis: aiText,
      });
    }

    // ==========================================
    // VALIDATE RISK SCORE
    // ==========================================

    const riskScore = Math.min(
      100,
      Math.max(0, Number(analysis.riskScore) || 0)
    );

    // ==========================================
    // VALIDATE RISK LEVEL
    // ==========================================

    const allowedRiskLevels = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL",
    ];

    let riskLevel = analysis.riskLevel;

    if (!allowedRiskLevels.includes(riskLevel)) {
      if (riskScore >= 80) {
        riskLevel = "CRITICAL";
      } else if (riskScore >= 60) {
        riskLevel = "HIGH";
      } else if (riskScore >= 30) {
        riskLevel = "MEDIUM";
      } else {
        riskLevel = "LOW";
      }
    }

    // ==========================================
    // NORMALIZE AI DATA
    // ==========================================

    const signals = Array.isArray(analysis.signals)
      ? analysis.signals
      : [];

    const suspiciousText =
      typeof analysis.suspiciousText === "string"
        ? analysis.suspiciousText
        : "";

    const callerOrSender =
      typeof analysis.callerOrSender === "string"
        ? analysis.callerOrSender
        : "";

    const explanation =
      typeof analysis.explanation === "string"
        ? analysis.explanation
        : "";

    const recommendation =
      typeof analysis.recommendation === "string"
        ? analysis.recommendation
        : "";

    // ==========================================
    // GENERATE EVIDENCE ID
    // ==========================================

    const evidenceId =
      "CS-" +
      Math.floor(1000 + Math.random() * 9000);

    // ==========================================
    // CREATE SECURITY EVENT
    // ==========================================

    const event = await SecurityEvent.create({
      user: user._id,

      type: "SCREENSHOT_ANALYSIS",

      title:
        riskScore >= 60
          ? "Suspicious Screenshot Detected"
          : "Screenshot Analysis Completed",

      description:
        explanation ||
        "Screenshot analyzed by Cyber Shield AI.",

      riskScore,

      riskLevel,

      status:
        riskScore >= 60
          ? "DETECTED"
          : "RESOLVED",

      metadata: {
        evidenceId,

        originalFileName: req.file.originalname,

        storedFileName: req.file.filename,

        mimeType: req.file.mimetype,

        fileSize: req.file.size,

        signals,

        suspiciousText,

        callerOrSender,

        explanation,

        recommendation,

        analyzedBy: "Gemini AI",
      },
    });

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      message: "Screenshot analyzed successfully",

      analysis: {
        riskScore,
        riskLevel,
        signals,
        suspiciousText,
        callerOrSender,
        explanation,
        recommendation,
      },

      evidence: {
        id: evidenceId,
        eventId: event._id,
        status: event.status,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Screenshot analysis error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Screenshot analysis failed",
      error: error.message,
    });
  } finally {
    // ==========================================
    // DELETE TEMPORARY IMAGE
    // ==========================================

    if (
      uploadedFilePath &&
      fs.existsSync(uploadedFilePath)
    ) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (deleteError) {
        console.error(
          "Temporary image cleanup failed:",
          deleteError.message
        );
      }
    }
  }
};

module.exports = {
  analyzeScreenshot,
};