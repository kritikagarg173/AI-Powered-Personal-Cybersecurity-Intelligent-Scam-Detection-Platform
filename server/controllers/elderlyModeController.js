const ElderlyMode = require("../models/ElderlyMode");
const EmergencyAlert = require("../models/EmergencyAlert");

const {
  buildSafetyOverview,
} = require("../services/elderlySafetyService");


// ======================================================
// GET ELDERLY MODE STATUS
// ======================================================

const getElderlyModeStatus = async (req, res) => {

  try {

    let settings = await ElderlyMode.findOne();


    // Create default settings if none exist
    if (!settings) {

      settings = await ElderlyMode.create({

        elderlyModeEnabled: true,

        aiGuardianEnabled: true,

        scamProtection: true,

        callProtection: true,

        fraudAlerts: true,

        activeThreats: 0,

      });
    }


    // Calculate dynamic protection score
    const overview =
      buildSafetyOverview(settings);


    settings.protectionScore =
      overview.protectionScore;


    settings.lastSafetyCheck =
      new Date();


    await settings.save();


    return res.status(200).json({

      success: true,

      settings,

      overview,

    });

  }

  catch (error) {

    console.error(
      "Get Elderly Mode Status Error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to load elderly mode status",

    });
  }
};


// ======================================================
// UPDATE ELDERLY MODE SETTINGS
// ======================================================

const updateElderlyModeSettings =
  async (req, res) => {

    try {

      const {

        elderlyModeEnabled,

        aiGuardianEnabled,

        scamProtection,

        callProtection,

        fraudAlerts,

      } = req.body;


      let settings =
        await ElderlyMode.findOne();


      if (!settings) {

        settings =
          new ElderlyMode();

      }


      // Update only values received from frontend

      if (
        typeof elderlyModeEnabled ===
        "boolean"
      ) {

        settings.elderlyModeEnabled =
          elderlyModeEnabled;

      }


      if (
        typeof aiGuardianEnabled ===
        "boolean"
      ) {

        settings.aiGuardianEnabled =
          aiGuardianEnabled;

      }


      if (
        typeof scamProtection ===
        "boolean"
      ) {

        settings.scamProtection =
          scamProtection;

      }


      if (
        typeof callProtection ===
        "boolean"
      ) {

        settings.callProtection =
          callProtection;

      }


      if (
        typeof fraudAlerts ===
        "boolean"
      ) {

        settings.fraudAlerts =
          fraudAlerts;

      }


      settings.lastSafetyCheck =
        new Date();


      // Recalculate score
      const overview =
        buildSafetyOverview(settings);


      settings.protectionScore =
        overview.protectionScore;


      await settings.save();


      return res.status(200).json({

        success: true,

        message:
          "Elderly mode settings updated successfully",

        settings,

        overview,

      });

    }

    catch (error) {

      console.error(
        "Update Elderly Mode Error:",
        error.message
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to update elderly mode settings",

      });

    }

  };


// ======================================================
// CREATE SOS ALERT
// ======================================================

const createSOSAlert =
  async (req, res) => {

    try {

      const {

        latitude,

        longitude,

        message,

        selectedContacts = [],

      } = req.body;


      // ==================================================
      // CLEAN SELECTED CONTACTS
      // ==================================================

      const notifiedContacts =
        Array.isArray(selectedContacts)

          ? selectedContacts

              .filter(
                (contact) =>
                  contact &&
                  contact.name &&
                  contact.phone
              )

              .map((contact) => ({

                name:
                  String(
                    contact.name
                  ).trim(),

                phone:
                  String(
                    contact.phone
                  ).trim(),

              }))

          : [];


      // ==================================================
      // CHECK LOCATION
      // ==================================================

      const hasLocation =

        typeof latitude === "number" &&

        typeof longitude === "number";


      // ==================================================
      // CREATE GOOGLE MAPS LINK
      // ==================================================

      const locationShareUrl =
        hasLocation

          ? `https://www.google.com/maps?q=${latitude},${longitude}`

          : null;


      // ==================================================
      // CREATE EMERGENCY ALERT
      // ==================================================

      const alert =
        await EmergencyAlert.create({

          type: "SOS",

          message:
            message ||
            "Emergency assistance requested from Elderly Mode",

          location: {

            latitude:
              hasLocation
                ? latitude
                : null,

            longitude:
              hasLocation
                ? longitude
                : null,

          },

          notifiedContacts,

          status: "active",

          source: "elderly-mode",

        });


      // ==================================================
      // UPDATE ELDERLY MODE THREAT STATUS
      // ==================================================

      let settings =
        await ElderlyMode.findOne();


      if (!settings) {

        settings =
          await ElderlyMode.create({});

      }


      settings.activeThreats += 1;


      const overview =
        buildSafetyOverview(settings);


      settings.protectionScore =
        overview.protectionScore;


      settings.lastSafetyCheck =
        new Date();


      await settings.save();


      // ==================================================
      // DYNAMIC SOS RESPONSE
      // ==================================================

      let responseMessage =
        "SOS alert activated";


      if (
        hasLocation &&
        notifiedContacts.length > 0
      ) {

        responseMessage =
          `Emergency alert activated. Live location prepared for ${notifiedContacts.length} trusted contact${notifiedContacts.length > 1 ? "s" : ""}.`;

      }

      else if (
        notifiedContacts.length > 0
      ) {

        responseMessage =
          `Emergency alert activated for ${notifiedContacts.length} trusted contact${notifiedContacts.length > 1 ? "s" : ""}. Location was not available.`;

      }

      else if (hasLocation) {

        responseMessage =
          "Emergency alert activated and location captured. No trusted contact was selected.";

      }


      // ==================================================
      // SEND RESPONSE
      // ==================================================

      return res.status(201).json({

        success: true,

        message: responseMessage,

        alert,

        overview,

        delivery: {

          selectedContacts:
            notifiedContacts,

          contactCount:
            notifiedContacts.length,

          locationCaptured:
            hasLocation,

          locationShareUrl,

        },

      });

    }

    catch (error) {

      console.error(
        "SOS Alert Error:",
        error.message
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to create SOS alert",

      });

    }

  };


// ======================================================
// GET ALL EMERGENCY ALERTS
// ======================================================

const getEmergencyAlerts =
  async (req, res) => {

    try {

      const alerts =
        await EmergencyAlert.find()
          .sort({
            createdAt: -1,
          });


      return res.status(200).json({

        success: true,

        count:
          alerts.length,

        alerts,

      });

    }

    catch (error) {

      console.error(
        "Get Emergency Alerts Error:",
        error.message
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch emergency alerts",

      });

    }

  };


// ======================================================
// RESOLVE EMERGENCY ALERT
// ======================================================

const resolveEmergencyAlert =
  async (req, res) => {

    try {

      const { id } =
        req.params;


      const alert =
        await EmergencyAlert.findById(id);


      if (!alert) {

        return res.status(404).json({

          success: false,

          message:
            "Emergency alert not found",

        });

      }


      // Only resolve once
      if (
        alert.status !== "resolved"
      ) {

        alert.status =
          "resolved";


        alert.resolvedAt =
          new Date();


        await alert.save();


        // Update active threats
        const settings =
          await ElderlyMode.findOne();


        if (settings) {

          settings.activeThreats =
            Math.max(
              0,
              settings.activeThreats - 1
            );


          const overview =
            buildSafetyOverview(
              settings
            );


          settings.protectionScore =
            overview.protectionScore;


          settings.lastSafetyCheck =
            new Date();


          await settings.save();

        }

      }


      return res.status(200).json({

        success: true,

        message:
          "Emergency alert resolved successfully",

        alert,

      });

    }

    catch (error) {

      console.error(
        "Resolve Emergency Alert Error:",
        error.message
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to resolve emergency alert",

      });

    }

  };


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {

  getElderlyModeStatus,

  updateElderlyModeSettings,

  createSOSAlert,

  getEmergencyAlerts,

  resolveEmergencyAlert,

};