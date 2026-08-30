import { API_BASE_URL } from "./apiConfig";

// ======================================================
// GET ELDERLY MODE STATUS
// ======================================================

export const getElderlyModeStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/elderly/status`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load elderly mode"
    );
  }

  return data;
};


// ======================================================
// UPDATE ELDERLY MODE SETTINGS
// ======================================================

export const updateElderlyModeSettings = async (settings) => {
  const response = await fetch(
    `${API_BASE_URL}/elderly/settings`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(settings),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update elderly mode"
    );
  }

  return data;
};


// ======================================================
// SEND SOS ALERT
// ======================================================

export const sendSOSAlert = async ({
  latitude = null,
  longitude = null,
  selectedContacts = [],
  message =
    "Emergency assistance requested from Elderly Mode",
} = {}) => {

  const response = await fetch(
    `${API_BASE_URL}/elderly/sos`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        latitude,
        longitude,
        message,
        selectedContacts,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to send SOS alert"
    );
  }

  return data;
};


// ======================================================
// GET ALL TRUSTED CONTACTS
// ======================================================

export const getTrustedContacts = async () => {

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/contacts`,
    {
      method: "GET",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch trusted contacts"
    );
  }

  return data;
};
// ======================================================
// START SOS ESCALATION
// ======================================================

export const startSOSEscalation = async (
  alertId,
  contacts
) => {
  const response = await fetch(
    `${API_BASE_URL}/sos-escalation/start`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        alertId,
        contacts,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to start escalation"
    );
  }

  return data;
};


// ======================================================
// ESCALATE NEXT CONTACT
// ======================================================

export const escalateSOS = async (
  escalationId
) => {
  const response = await fetch(
    `${API_BASE_URL}/sos-escalation/${escalationId}/escalate`,
    {
      method: "PUT",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to escalate SOS"
    );
  }

  return data;
};


// ======================================================
// ACKNOWLEDGE SOS
// ======================================================

export const acknowledgeSOS = async (
  escalationId
) => {
  const response = await fetch(
    `${API_BASE_URL}/sos-escalation/${escalationId}/acknowledge`,
    {
      method: "PUT",
    }
  );

  return response.json();
};


// ======================================================
// CREATE EMERGENCY EVIDENCE
// ======================================================

export const createEmergencyEvidence =
  async (payload) => {

    const response =
      await fetch(
        `${API_BASE_URL}/emergency-evidence`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(payload),
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
          "Failed to create evidence pack"
      );

    }


    return data;
  };