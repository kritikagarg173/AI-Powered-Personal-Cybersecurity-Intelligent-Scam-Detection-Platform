const EmergencyEvidence =
  require("../models/EmergencyEvidence");

const EmergencyAlert =
  require("../models/EmergencyAlert");


// ==========================================
// CREATE EVIDENCE PACK
// ==========================================

const createEvidencePack = async (
  req,
  res
) => {
  try {
    const {
      alertId,
      callerNumber,
      suspiciousKeywords,
      screenshotUrl,
      riskScore,
      latitude,
      longitude,
      notes,
    } = req.body;


    const alert =
      await EmergencyAlert.findById(
        alertId
      );


    if (!alert) {
      return res.status(404).json({
        success: false,
        message:
          "Emergency alert not found",
      });
    }


    const evidence =
      await EmergencyEvidence.create({
        alertId,

        incidentType:
          alert.type || "SOS",

        callerNumber:
          callerNumber || "",

        suspiciousKeywords:
          suspiciousKeywords || [],

        screenshotUrl:
          screenshotUrl || "",

        riskScore:
          Number(riskScore) || 0,

        location: {
          latitude:
            typeof latitude ===
            "number"
              ? latitude
              : alert.location
                  ?.latitude,

          longitude:
            typeof longitude ===
            "number"
              ? longitude
              : alert.location
                  ?.longitude,
        },

        notes:
          notes || "",
      });


    return res.status(201).json({
      success: true,

      message:
        "Emergency evidence pack created",

      evidence,
    });

  } catch (error) {
    console.error(
      "Evidence pack error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create evidence pack",
    });
  }
};


// ==========================================
// GET EVIDENCE PACK
// ==========================================

const getEvidencePack = async (
  req,
  res
) => {
  try {

    const evidence =
      await EmergencyEvidence.findOne({
        alertId:
          req.params.alertId,
      });


    if (!evidence) {
      return res.status(404).json({
        success: false,
        message:
          "Evidence pack not found",
      });
    }


    return res.status(200).json({
      success: true,
      evidence,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch evidence pack",
    });

  }
};


module.exports = {
  createEvidencePack,
  getEvidencePack,
};