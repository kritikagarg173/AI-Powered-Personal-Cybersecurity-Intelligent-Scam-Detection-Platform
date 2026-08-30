const EmergencyAlert = require("../models/EmergencyAlert");
const SOSEscalation = require("../models/SOSEscalation");

// ==========================================
// START SOS ESCALATION
// ==========================================

const startEscalation = async (req, res) => {
  try {
    const {
      alertId,
      contacts = [],
    } = req.body;

    if (!alertId) {
      return res.status(400).json({
        success: false,
        message: "Alert ID is required",
      });
    }

    const alert =
      await EmergencyAlert.findById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Emergency alert not found",
      });
    }

    const sortedContacts = [...contacts]
      .filter(
        (contact) =>
          contact.name &&
          contact.phone
      )
      .sort(
        (a, b) =>
          (a.priority || 99) -
          (b.priority || 99)
      )
      .map((contact, index) => ({
        name: contact.name,
        phone: contact.phone,
        priority:
          contact.priority || index + 1,
        status:
          index === 0
            ? "notified"
            : "pending",
        notifiedAt:
          index === 0
            ? new Date()
            : null,
      }));

    if (sortedContacts.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one trusted contact is required",
      });
    }

    const escalation =
      await SOSEscalation.create({
        alertId,
        contacts: sortedContacts,
        currentContactIndex: 0,
        status: "waiting",
      });

    return res.status(201).json({
      success: true,
      message: `${sortedContacts[0].name} alerted`,
      escalation,
    });

  } catch (error) {
    console.error(
      "Start escalation error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to start SOS escalation",
    });
  }
};


// ==========================================
// ESCALATE TO NEXT CONTACT
// ==========================================

const escalateNext = async (req, res) => {
  try {
    const { id } = req.params;

    const escalation =
      await SOSEscalation.findById(id);

    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: "Escalation not found",
      });
    }

    if (
      escalation.status ===
      "acknowledged"
    ) {
      return res.status(200).json({
        success: true,
        escalation,
      });
    }

    const currentIndex =
      escalation.currentContactIndex;

    const nextIndex =
      currentIndex + 1;

    if (
      nextIndex >=
      escalation.contacts.length
    ) {
      escalation.status =
        "emergency-assistance-required";

      await escalation.save();

      return res.status(200).json({
        success: true,
        message:
          "No trusted contact acknowledged. Emergency assistance required.",
        escalation,
      });
    }

    escalation.currentContactIndex =
      nextIndex;

    escalation.status =
      "escalating";

    escalation.contacts[
      nextIndex
    ].status = "notified";

    escalation.contacts[
      nextIndex
    ].notifiedAt = new Date();

    await escalation.save();

    escalation.status = "waiting";

    await escalation.save();

    return res.status(200).json({
      success: true,

      message: `Escalated to ${escalation.contacts[nextIndex].name}`,

      escalation,
    });

  } catch (error) {
    console.error(
      "Escalate next error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to escalate SOS",
    });
  }
};


// ==========================================
// ACKNOWLEDGE SOS
// ==========================================

const acknowledgeSOS = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const escalation =
      await SOSEscalation.findById(id);

    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: "Escalation not found",
      });
    }

    const index =
      escalation.currentContactIndex;

    escalation.contacts[
      index
    ].status = "acknowledged";

    escalation.contacts[
      index
    ].acknowledgedAt =
      new Date();

    escalation.status =
      "acknowledged";

    await escalation.save();

    return res.status(200).json({
      success: true,

      message: `${escalation.contacts[index].name} acknowledged the emergency`,

      escalation,
    });

  } catch (error) {
    console.error(
      "Acknowledge SOS error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to acknowledge SOS",
    });
  }
};


// ==========================================
// GET ESCALATION
// ==========================================

const getEscalation = async (
  req,
  res
) => {
  try {
    const escalation =
      await SOSEscalation.findById(
        req.params.id
      );

    if (!escalation) {
      return res.status(404).json({
        success: false,
        message: "Escalation not found",
      });
    }

    return res.status(200).json({
      success: true,
      escalation,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch escalation",
    });
  }
};


module.exports = {
  startEscalation,
  escalateNext,
  acknowledgeSOS,
  getEscalation,
};