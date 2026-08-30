import { useEffect, useState } from "react";

import {
  ShieldCheck,
  Phone,
  Users,
  Link2,
  Volume2,
  AlertTriangle,
  HeartPulse,
  CheckCircle2,
  Lock,
  ArrowRight,
  BellRing,
  UserRound,
} from "lucide-react";

import {
  getElderlyModeStatus,
  updateElderlyModeSettings,
  sendSOSAlert,
  getTrustedContacts,
  startSOSEscalation,
  escalateSOS,
  acknowledgeSOS,
  createEmergencyEvidence,
} from "../services/elderlyModeService";

import VoiceSafetyAssistant from "../components/VoiceSafetyAssistant";

function ElderlyMode() {
  const [sosActive, setSosActive] = useState(false);

  const [guardianEnabled, setGuardianEnabled] =
    useState(true);

  const [settings, setSettings] = useState(null);

  const [overview, setOverview] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [sosLoading, setSosLoading] =
    useState(false);

  const [primaryContact, setPrimaryContact] = useState(null);
  const [trustedContacts, setTrustedContacts] = useState([]);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  // Final Elderly Mode features
  const [escalation, setEscalation] = useState(null);
  const [escalationMessage, setEscalationMessage] = useState("");
  const [evidencePack, setEvidencePack] = useState(null);
  const [ackLoading, setAckLoading] = useState(false);


  // ==========================================
  // LOAD ELDERLY MODE STATUS
  // ==========================================

  useEffect(() => {
    const loadElderlyMode = async () => {
      try {
        setLoading(true);
        setError("");

        // Load trusted contacts independently so a contact API error
        // does not break the whole Elderly Mode page.
        try {
          const contactData = await getTrustedContacts();

          if (contactData.contacts?.length > 0) {
            const contacts = contactData.contacts;
            const primary =
              contacts.find((contact) => contact.isPrimary) || contacts[0];

            setTrustedContacts(contacts);
            setPrimaryContact(primary);
            setSelectedContactIds(contacts.map((contact) => contact._id));
          } else {
            setTrustedContacts([]);
            setPrimaryContact(null);
            setSelectedContactIds([]);
          }
        } catch (contactError) {
          console.error(
            "Failed to load trusted contacts:",
            contactError
          );
          setTrustedContacts([]);
          setPrimaryContact(null);
          setSelectedContactIds([]);
        }

        const data = await getElderlyModeStatus();

        setSettings(data.settings);
        setOverview(data.overview);

        setGuardianEnabled(
          data.settings?.aiGuardianEnabled ?? true
        );

      } catch (error) {
        console.error(
          "Failed to load elderly mode:",
          error
        );

        setError(
          error.message ||
            "Failed to load protection status"
        );

      } finally {
        setLoading(false);
      }
    };

    loadElderlyMode();
  }, []);

  // ==========================================
  // SOS AUTO ESCALATION LADDER
  // ==========================================

  useEffect(() => {
    if (!escalation?._id) return;

    if (
      escalation.status === "acknowledged" ||
      escalation.status === "resolved" ||
      escalation.status === "emergency-assistance-required"
    ) {
      return;
    }

    const delay = Math.max(
      5,
      Number(escalation.escalationDelaySeconds) || 20
    ) * 1000;

    const timer = setTimeout(async () => {
      try {
        const response = await escalateSOS(escalation._id);
        setEscalation(response.escalation);
        setEscalationMessage(response.message || "SOS escalation updated");
      } catch (escalationError) {
        console.error("Auto escalation failed:", escalationError);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [escalation]);


  // ==========================================
  // AI GUARDIAN TOGGLE
  // ==========================================

  const handleGuardianToggle = async () => {
    const newValue = !guardianEnabled;

    try {
      setGuardianEnabled(newValue);

      const data =
        await updateElderlyModeSettings({
          aiGuardianEnabled: newValue,
        });

      setSettings(data.settings);
      setOverview(data.overview);

      setGuardianEnabled(
        data.settings.aiGuardianEnabled
      );

    } catch (error) {
      console.error(
        "Guardian Toggle Error:",
        error
      );

      // Restore previous value if API fails
      setGuardianEnabled(!newValue);

      setError(
        error.message ||
          "Failed to update AI Guardian"
      );
    }
  };


  // ==========================================
  // SOS
  // ==========================================

  const triggerSOS = async (
    latitude = null,
    longitude = null,
    contactsToNotify = []
  ) => {
    try {
      setSosLoading(true);
      setError("");
      setSosResult(null);
      setEscalation(null);
      setEscalationMessage("");
      setEvidencePack(null);

      // 1. Create the main SOS alert
      const data = await sendSOSAlert({
        latitude,
        longitude,
        selectedContacts: contactsToNotify.map((contact) => ({
          name: contact.name,
          phone: contact.phone,
        })),
      });

      setSosActive(true);
      setSosResult(data.delivery || null);
      setSosModalOpen(false);

      if (data.overview) {
        setOverview(data.overview);
      }

      const alertId = data.alert?._id;

      // 2. Automatically create an Emergency Evidence Pack
      if (alertId) {
        try {
          const evidenceResponse = await createEmergencyEvidence({
            alertId,
            latitude,
            longitude,
            riskScore: 100,
            suspiciousKeywords: [],
            notes:
              "Manual SOS activated from Elderly Mode. Location and escalation details preserved for the incident record.",
          });

          setEvidencePack(evidenceResponse.evidence || null);
        } catch (evidenceError) {
          console.error("Evidence Pack Error:", evidenceError);
        }

        // 3. Start priority-based SOS escalation
        try {
          const escalationResponse = await startSOSEscalation(
            alertId,
            contactsToNotify.map((contact, index) => ({
              name: contact.name,
              phone: contact.phone,
              priority: contact.priority || index + 1,
            }))
          );

          setEscalation(escalationResponse.escalation || null);
          setEscalationMessage(
            escalationResponse.message || "SOS escalation started"
          );
        } catch (escalationError) {
          console.error("Escalation Start Error:", escalationError);
        }
      }

      setTimeout(() => {
        setSosActive(false);
      }, 8000);
    } catch (error) {
      console.error("SOS Error:", error);
      setError(error.message || "Failed to send SOS alert");
    } finally {
      setSosLoading(false);
      setLocationStatus("idle");
    }
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContactIds((current) =>
      current.includes(contactId)
        ? current.filter((id) => id !== contactId)
        : [...current, contactId]
    );
  };

  const selectAllContacts = () => {
    setSelectedContactIds(trustedContacts.map((contact) => contact._id));
  };

  const handleSOS = () => {
    if (trustedContacts.length === 0) {
      setError("Please add at least one trusted contact before sending SOS.");
      return;
    }

    setError("");
    setSosModalOpen(true);
  };

  const confirmSOS = () => {
    const contactsToNotify = trustedContacts.filter((contact) =>
      selectedContactIds.includes(contact._id)
    );

    if (contactsToNotify.length === 0) {
      setError("Choose at least one emergency contact.");
      return;
    }

    setLocationStatus("locating");

    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      triggerSOS(null, null, contactsToNotify);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus("captured");
        triggerSOS(
          position.coords.latitude,
          position.coords.longitude,
          contactsToNotify
        );
      },
      () => {
        setLocationStatus("denied");
        triggerSOS(null, null, contactsToNotify);
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
      }
    );
  };


  // ==========================================
  // QUICK ACTIONS
  // ==========================================

  const handleCallFamily = () => {
    if (!primaryContact?.phone) {
      setError("No primary trusted contact with a phone number found.");
      return;
    }

    window.location.href = `tel:${primaryContact.phone}`;
  };

  const handleTrustedContacts = () => {
    window.location.href = "/trusted-contacts";
  };

  const handleCheckLink = () => {
    window.location.href = "/link-scanner";
  };

  const handleGetAssistance = () => {
    window.location.href = "/ai-assistant";
  };

  const handleAcknowledgeCurrentSOS = async () => {
    if (!escalation?._id) return;

    try {
      setAckLoading(true);
      const response = await acknowledgeSOS(escalation._id);
      setEscalation(response.escalation || escalation);
      setEscalationMessage(
        response.message || "Emergency acknowledged by trusted contact"
      );
    } catch (ackError) {
      console.error("SOS acknowledgement failed:", ackError);
      setError(ackError.message || "Failed to acknowledge SOS");
    } finally {
      setAckLoading(false);
    }
  };


  // ==========================================
  // DYNAMIC VALUES
  // ==========================================

  const protectionScore =
    overview?.protectionScore ??
    settings?.protectionScore ??
    100;

  const protectionStatus =
    overview?.protectionStatus ??
    "Excellent";

  const activeThreats =
    overview?.activeThreats ??
    settings?.activeThreats ??
    0;

  const scamProtection =
    overview?.scamProtection ??
    settings?.scamProtection ??
    true;

  const callProtection =
    overview?.callProtection ??
    settings?.callProtection ??
    true;

  const fraudAlerts =
    overview?.fraudAlerts ??
    settings?.fraudAlerts ??
    true;


  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* API ERROR */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>
        </div>
      )}


      {/* LOADING */}

      {loading && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm font-semibold text-blue-700">
            🛡️ Loading your protection status...
          </p>
        </div>
      )}


      {/* HERO */}

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-7 text-white shadow-xl md:p-9">

        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />


        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-center">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">

              <ShieldCheck size={15} />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                Elderly Protection
              </span>

            </div>


            <h1 className="max-w-xl text-3xl font-bold tracking-tight md:text-4xl">

              Simple protection.

              <br />

              <span className="text-blue-200">
                Powerful security.
              </span>

            </h1>


            <p className="mt-4 max-w-lg text-sm leading-6 text-blue-100">

              A simplified safety experience designed to help seniors stay
              protected from scams, unsafe calls and digital threats.

            </p>

          </div>


          <div className="flex min-w-[230px] flex-col items-center rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">

            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                guardianEnabled
                  ? "bg-green-400/15"
                  : "bg-red-400/15"
              }`}
            >

              <ShieldCheck
                size={34}
                className={
                  guardianEnabled
                    ? "text-green-300"
                    : "text-red-300"
                }
              />

            </div>


            <p className="mt-3 text-sm font-bold">

              {guardianEnabled
                ? "Protection Active"
                : "Protection Limited"}

            </p>


            <div
              className={`mt-2 flex items-center gap-2 text-[10px] font-semibold ${
                guardianEnabled
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >

              <span
                className={`h-2 w-2 rounded-full ${
                  guardianEnabled
                    ? "bg-green-300"
                    : "bg-red-300"
                }`}
              />

              {guardianEnabled
                ? "AI Guardian is watching"
                : "AI Guardian is disabled"}

            </div>

          </div>

        </div>

      </section>


      {/* GREETING */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">

              <UserRound size={27} />

            </div>


            <div>

              <p className="text-xs font-semibold text-blue-600">
                Welcome back
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Your safety center
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Everything you need is just one tap away.
              </p>

            </div>

          </div>


          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
              activeThreats === 0
                ? "bg-green-50"
                : "bg-red-50"
            }`}
          >

            {activeThreats === 0 ? (
              <CheckCircle2
                size={17}
                className="text-green-600"
              />
            ) : (
              <AlertTriangle
                size={17}
                className="text-red-600"
              />
            )}


            <span
              className={`text-xs font-semibold ${
                activeThreats === 0
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >

              {activeThreats === 0
                ? "No active threats"
                : `${activeThreats} active ${
                    activeThreats === 1
                      ? "threat"
                      : "threats"
                  }`}

            </span>

          </div>

        </div>

      </section>


      {/* EMERGENCY + QUICK ACTIONS */}

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">

        {/* SOS */}

        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-2">

            <BellRing
              size={18}
              className="text-red-600"
            />

            <h2 className="text-sm font-bold text-slate-800">
              Emergency Assistance
            </h2>

          </div>


          <div className="mt-5 flex flex-col items-center rounded-3xl bg-red-50 p-6">

            <button
              onClick={handleSOS}
              disabled={sosLoading}
              className={`group flex h-32 w-32 items-center justify-center rounded-full text-white shadow-xl transition active:scale-95 ${
                sosActive
                  ? "bg-red-800 shadow-red-700/30"
                  : "bg-red-600 shadow-red-600/25 hover:scale-[1.03] hover:bg-red-700"
              } ${
                sosLoading
                  ? "cursor-not-allowed opacity-70"
                  : ""
              }`}
            >

              <div className="text-center">

                <AlertTriangle
                  size={32}
                  className="mx-auto"
                />

                <p className="mt-1 text-lg font-black tracking-wide">
                  SOS
                </p>

              </div>

            </button>


            <p className="mt-5 text-center text-sm font-bold text-red-700">

              {sosLoading
                ? "Sending emergency alert..."
                : sosActive
                ? "Emergency alert activated"
                : "Tap for emergency help"}

            </p>


            <p className="mt-1 text-center text-[10px] leading-4 text-red-500">
              {sosResult
                ? sosResult.locationCaptured
                  ? `Location captured and SOS prepared for ${sosResult.contactCount} selected contact${sosResult.contactCount === 1 ? "" : "s"}.`
                  : `SOS prepared for ${sosResult.contactCount} selected contact${sosResult.contactCount === 1 ? "" : "s"}. Location permission was unavailable.`
                : "Choose emergency contacts and share your current location."}
            </p>

            {sosResult?.locationShareUrl && (
              <a
                href={sosResult.locationShareUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 text-[10px] font-bold text-blue-700 underline"
              >
                Open captured location on map
              </a>
            )}

          </div>

        </div>


        {/* QUICK ACTIONS */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-sm font-bold text-slate-800">
                Quick Safety Actions
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Large controls for easy access
              </p>

            </div>


            <ShieldCheck
              size={19}
              className="text-blue-700"
            />

          </div>


          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <button
              onClick={handleCallFamily}
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Phone size={21} />
              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm font-bold text-slate-800">
                  Call Family
                </span>

                <ArrowRight
                  size={15}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />

              </div>

            </button>


            <button
              onClick={handleTrustedContacts}
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Users size={21} />
              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm font-bold text-slate-800">
                  Trusted Contacts
                </span>

                <ArrowRight
                  size={15}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />

              </div>

            </button>


            <button
              onClick={handleCheckLink}
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Link2 size={21} />
              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm font-bold text-slate-800">
                  Check a Link
                </span>

                <ArrowRight
                  size={15}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />

              </div>

            </button>


            <button
              onClick={handleGetAssistance}
              className="group flex min-h-[105px] flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Volume2 size={21} />
              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm font-bold text-slate-800">
                  Get Assistance
                </span>

                <ArrowRight
                  size={15}
                  className="text-slate-400 transition group-hover:translate-x-1"
                />

              </div>

            </button>

          </div>

        </div>

      </section>


      {/* VOICE SAFETY ASSISTANT */}

      <VoiceSafetyAssistant
        onSOS={handleSOS}
        primaryContact={primaryContact}
      />


      {/* SOS ESCALATION LADDER */}

      {escalation && (
        <section className="rounded-3xl border border-orange-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Emergency Escalation
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                🚨 SOS Escalation Ladder
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {escalationMessage || "Waiting for trusted-contact acknowledgement..."}
              </p>
            </div>

            <div
              className={`rounded-xl px-4 py-2 text-xs font-bold ${
                escalation.status === "acknowledged"
                  ? "bg-green-50 text-green-700"
                  : escalation.status === "emergency-assistance-required"
                  ? "bg-red-50 text-red-700"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              {escalation.status?.replaceAll("-", " ") || "waiting"}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {escalation.contacts?.map((contact, index) => (
              <div
                key={`${contact.phone}-${index}`}
                className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-orange-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {contact.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Priority {contact.priority || index + 1}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                    contact.status === "acknowledged"
                      ? "bg-green-100 text-green-700"
                      : contact.status === "notified"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {contact.status}
                </span>
              </div>
            ))}
          </div>

          {escalation.status !== "acknowledged" &&
            escalation.status !== "emergency-assistance-required" && (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-700">
                  ⏳ Waiting for acknowledgement. If there is no response, the next priority contact will be selected automatically.
                </p>

                <button
                  type="button"
                  onClick={handleAcknowledgeCurrentSOS}
                  disabled={ackLoading}
                  className="mt-3 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-800 disabled:opacity-50"
                >
                  {ackLoading
                    ? "Acknowledging..."
                    : "Demo: Mark Current Contact Responded"}
                </button>
              </div>
            )}

          {escalation.status === "emergency-assistance-required" && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="font-bold text-red-700">
                ⚠ Emergency Assistance Required
              </p>
              <p className="mt-1 text-xs leading-5 text-red-600">
                No selected trusted contact acknowledged the emergency. The incident is now marked for urgent external assistance.
              </p>
            </div>
          )}

          {escalation.status === "acknowledged" && (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="font-bold text-green-700">
                ✅ Trusted Contact Responded
              </p>
              <p className="mt-1 text-xs text-green-600">
                Escalation has stopped because the emergency was acknowledged.
              </p>
            </div>
          )}
        </section>
      )}


      {/* EMERGENCY EVIDENCE PACK */}

      {evidencePack && (
        <section className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Incident Record
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                📦 Emergency Evidence Pack
              </h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                A structured incident record has been preserved for family review and future reporting.
              </p>
            </div>

            <div className="rounded-xl bg-red-50 px-4 py-2 text-sm font-black text-red-700">
              Risk {evidencePack.riskScore ?? 0}%
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Incident
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {evidencePack.incidentType || "SOS"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Timestamp
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {evidencePack.generatedAt
                  ? new Date(evidencePack.generatedAt).toLocaleString()
                  : "Recorded now"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Latitude
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {evidencePack.location?.latitude ?? "Unavailable"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Longitude
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-700">
                {evidencePack.location?.longitude ?? "Unavailable"}
              </p>
            </div>
          </div>

          {evidencePack.suspiciousKeywords?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold text-slate-700">
                Suspicious Keywords
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {evidencePack.suspiciousKeywords.map((keyword, index) => (
                  <span
                    key={`${keyword}-${index}`}
                    className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 rounded-2xl bg-blue-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
              Evidence ID
            </p>
            <p className="mt-1 break-all text-xs font-bold text-blue-800">
              {evidencePack._id}
            </p>
          </div>

          {sosResult?.locationShareUrl && (
            <a
              href={sosResult.locationShareUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-800"
            >
              Open Incident Location
            </a>
          )}
        </section>
      )}


      {/* AI GUARDIAN */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/20">

              <ShieldCheck size={27} />

            </div>


            <div>

              <h2 className="text-base font-bold text-slate-900">
                AI Guardian
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Automated protection against common digital scams.
              </p>

            </div>

          </div>


          <button
            onClick={handleGuardianToggle}
            disabled={loading}
            className={`relative h-8 w-14 rounded-full transition ${
              guardianEnabled
                ? "bg-blue-700"
                : "bg-slate-300"
            }`}
          >

            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                guardianEnabled
                  ? "left-7"
                  : "left-1"
              }`}
            />

          </button>

        </div>


        <div className="mt-6 grid gap-3 md:grid-cols-3">

          <div
            className={`rounded-2xl p-4 ${
              scamProtection
                ? "bg-green-50"
                : "bg-slate-100"
            }`}
          >

            <CheckCircle2
              size={18}
              className={
                scamProtection
                  ? "text-green-600"
                  : "text-slate-400"
              }
            />

            <p
              className={`mt-3 text-xs font-bold ${
                scamProtection
                  ? "text-green-700"
                  : "text-slate-600"
              }`}
            >
              Scam Protection
            </p>

            <p
              className={`mt-1 text-[10px] ${
                scamProtection
                  ? "text-green-600"
                  : "text-slate-500"
              }`}
            >
              {scamProtection
                ? "Active"
                : "Disabled"}
            </p>

          </div>


          <div
            className={`rounded-2xl p-4 ${
              callProtection
                ? "bg-blue-50"
                : "bg-slate-100"
            }`}
          >

            <Phone
              size={18}
              className={
                callProtection
                  ? "text-blue-700"
                  : "text-slate-400"
              }
            />

            <p
              className={`mt-3 text-xs font-bold ${
                callProtection
                  ? "text-blue-700"
                  : "text-slate-600"
              }`}
            >
              Call Protection
            </p>

            <p
              className={`mt-1 text-[10px] ${
                callProtection
                  ? "text-blue-600"
                  : "text-slate-500"
              }`}
            >
              {callProtection
                ? "Monitoring enabled"
                : "Monitoring disabled"}
            </p>

          </div>


          <div
            className={`rounded-2xl p-4 ${
              fraudAlerts
                ? "bg-amber-50"
                : "bg-slate-100"
            }`}
          >

            <AlertTriangle
              size={18}
              className={
                fraudAlerts
                  ? "text-amber-600"
                  : "text-slate-400"
              }
            />

            <p
              className={`mt-3 text-xs font-bold ${
                fraudAlerts
                  ? "text-amber-700"
                  : "text-slate-600"
              }`}
            >
              Fraud Alerts
            </p>

            <p
              className={`mt-1 text-[10px] ${
                fraudAlerts
                  ? "text-amber-600"
                  : "text-slate-500"
              }`}
            >
              {fraudAlerts
                ? "Real-time warnings"
                : "Alerts disabled"}
            </p>

          </div>

        </div>

      </section>


      {/* FAMILY CONNECTION */}

      <section className="grid gap-5 md:grid-cols-2">

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users size={21} />
            </div>


            <div>

              <h2 className="text-sm font-bold text-slate-800">
                Family Connection
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Your trusted safety network
              </p>

            </div>

          </div>


          <div className="mt-5 space-y-3">

            {trustedContacts.length > 0 ? (
              trustedContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {contact.name?.charAt(0).toUpperCase() || "T"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800">
                          {contact.name}
                        </p>
                        {contact.isPrimary && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                            Primary
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {contact.relationship || "Trusted Contact"}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Connected
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-700">
                  No trusted contacts found
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Add contacts from the Trusted Contacts page.
                </p>
              </div>
            )}

          </div>

        </div>


        {/* SAFETY STATUS */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <HeartPulse size={21} />
            </div>


            <div>

              <h2 className="text-sm font-bold text-slate-800">
                Safety Status
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Your current protection overview
              </p>

            </div>

          </div>


          <div className="mt-5 flex items-center justify-between">

            <div>

              <p className="text-3xl font-bold text-slate-900">
                {protectionScore}%
              </p>

              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Protection Score
              </p>

            </div>


            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
                protectionScore >= 90
                  ? "bg-green-50"
                  : protectionScore >= 75
                  ? "bg-blue-50"
                  : protectionScore >= 50
                  ? "bg-amber-50"
                  : "bg-red-50"
              }`}
            >

              <CheckCircle2
                size={16}
                className={
                  protectionScore >= 90
                    ? "text-green-600"
                    : protectionScore >= 75
                    ? "text-blue-600"
                    : protectionScore >= 50
                    ? "text-amber-600"
                    : "text-red-600"
                }
              />


              <span
                className={`text-xs font-bold ${
                  protectionScore >= 90
                    ? "text-green-700"
                    : protectionScore >= 75
                    ? "text-blue-700"
                    : protectionScore >= 50
                    ? "text-amber-700"
                    : "text-red-700"
                }`}
              >

                {protectionStatus}

              </span>

            </div>

          </div>

        </div>

      </section>


      {/* SOS CONTACT SELECTION MODAL */}

      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Emergency SOS
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Choose emergency contacts
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Select who should receive this SOS. Your current location will be captured after you confirm.
                </p>
              </div>

              <button
                onClick={() => setSosModalOpen(false)}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">
                {selectedContactIds.length} of {trustedContacts.length} selected
              </p>
              <button
                onClick={selectAllContacts}
                className="text-xs font-bold text-blue-700"
              >
                Select all
              </button>
            </div>

            <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {trustedContacts.map((contact) => {
                const selected = selectedContactIds.includes(contact._id);

                return (
                  <button
                    type="button"
                    key={contact._id}
                    onClick={() => toggleContactSelection(contact._id)}
                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {contact.name?.charAt(0).toUpperCase() || "T"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800">
                            {contact.name}
                          </p>
                          {contact.isPrimary && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {contact.relationship || "Trusted Contact"} • {contact.phone}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-black ${
                        selected
                          ? "border-blue-700 bg-blue-700 text-white"
                          : "border-slate-300 text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                  </button>
                );
              })}
            </div>

            {locationStatus === "locating" && (
              <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">
                📍 Getting your current location...
              </div>
            )}

            <button
              onClick={confirmSOS}
              disabled={sosLoading || selectedContactIds.length === 0}
              className="mt-5 w-full rounded-2xl bg-red-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sosLoading ? "Sending SOS..." : "Send SOS & Capture Location"}
            </button>

            <p className="mt-3 text-center text-[10px] leading-4 text-slate-400">
              For automatic SMS/WhatsApp delivery, connect a messaging provider such as Twilio or WhatsApp Cloud API.
            </p>
          </div>
        </div>
      )}


      {/* FOOTER */}

      <div className="flex items-center justify-center gap-2 pb-4 text-[10px] text-slate-400">

        <Lock size={12} />

        Elderly Mode is designed with accessibility and safety in mind.

      </div>

    </div>
  );
}

export default ElderlyMode;