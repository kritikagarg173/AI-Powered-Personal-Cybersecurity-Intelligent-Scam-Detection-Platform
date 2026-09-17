import { Capacitor } from "@capacitor/core";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { useEffect, useRef, useState } from "react";
import {
  PhoneCall,
  Mic,
  MicOff,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Siren,
  PhoneOff,
  Activity,
  Volume2,
  BrainCircuit,
  CheckCircle2,
  LockKeyhole,
  Radio,
  PauseCircle,
  Users,
  Clock3,
  BellRing,
} from "lucide-react";
import { API_BASE_URL } from "../services/apiConfig";
import {
  initializeProtectedCalling,
  acceptProtectedCall,
  rejectProtectedCall,
  endProtectedCall,
} from "../services/protectedCallService";

function LiveCallMonitoring() {
  const [monitoring, setMonitoring] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [riskScore, setRiskScore] = useState(8);
  const [riskLevel, setRiskLevel] = useState("LOW");
  const [detectedSignals, setDetectedSignals] = useState([]);
  const [warning, setWarning] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [incomingProtectedCall, setIncomingProtectedCall] = useState(false);
const [protectedCallerId, setProtectedCallerId] = useState("");
const [myProtectedCallId, setMyProtectedCallId] = useState("");
const [protectedCallActive, setProtectedCallActive] = useState(false);
const [protectedRemoteStream, setProtectedRemoteStream] = useState(null);

  const [status, setStatus] = useState("Ready to protect");
  const [error, setError] = useState("");

  // Safe Pause states
  const [safePause, setSafePause] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [guardianAlerted, setGuardianAlerted] = useState(false);
const [alertedGuardian, setAlertedGuardian] = useState(null);
  const recognitionRef = useRef(null);
  const countdownRef = useRef(null);
  // PROTECTED CALL INITIALIZATION
useEffect(() => {
  const deviceId =
    localStorage.getItem("cyber_protected_call_id") ||
    `cyber-${Math.random().toString(36).substring(2, 9)}`;

  localStorage.setItem(
    "cyber_protected_call_id",
    deviceId
  );
  setMyProtectedCallId(deviceId);

  initializeProtectedCalling(
    deviceId,
    (callerId) => {
      console.log("Incoming Protected Call:", callerId);

      setProtectedCallerId(callerId);
      setIncomingProtectedCall(true);
      setStatus("Incoming Protected Call detected");
    }
  );
}, []);
// ACCEPT PROTECTED CALL
const handleAcceptProtectedCall = async () => {
  try {
    setIncomingProtectedCall(false);
    setStatus("Connecting Protected Call...");

    await acceptProtectedCall((remoteStream) => {
      setProtectedRemoteStream(remoteStream);
      setProtectedCallActive(true);

      setStatus("Protected Call connected — AI Protection active");

      // Start existing AI monitoring automatically
      if (!monitoring) {
        startMonitoring();
      }
    });
  } catch (err) {
    console.error("Protected Call accept error:", err);
    setError("Unable to accept Protected Call");
  }
};

// REJECT PROTECTED CALL
const handleRejectProtectedCall = () => {
  rejectProtectedCall();

  setIncomingProtectedCall(false);
  setProtectedCallerId("");
  setProtectedCallActive(false);

  setStatus("Protected Call declined");
};

  const suspiciousPatterns = [
    {
      words: ["otp", "one time password", "verification code"],
      label: "OTP request",
      weight: 30,
    },
    {
      words: ["pin", "atm pin", "upi pin"],
      label: "PIN request",
      weight: 35,
    },
    {
      words: ["password", "login password"],
      label: "Password request",
      weight: 30,
    },
    {
      words: ["account blocked", "account will be blocked"],
      label: "Account threat",
      weight: 25,
    },
    {
      words: ["kyc", "update your kyc", "kyc verification"],
      label: "KYC request",
      weight: 18,
    },
    {
      words: ["urgent", "immediately", "right now"],
      label: "Urgency language",
      weight: 12,
    },
    {
      words: ["send money", "transfer money", "make a payment"],
      label: "Payment request",
      weight: 25,
    },
    {
      words: ["upi", "bank account", "credit card", "debit card"],
      label: "Financial information",
      weight: 20,
    },
    {
      words: ["remote access", "screen sharing", "anydesk"],
      label: "Remote access request",
      weight: 35,
    },
  ];

 const analyzeSpeech = async (text) => {
  if (!text || !text.trim()) return;

  try {
    

    const response = await fetch(
     `${API_BASE_URL}/call-monitoring/analyze`,
      {
        method: "POST",
        headers: {
  "Content-Type": "application/json",
},
        body: JSON.stringify({
          transcript: text,
          callerOrSender: "",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Call analysis failed");
    }

    const analysis = data.analysis;

    if (!analysis) {
      throw new Error("Analysis data not received from backend");
    }

    // Backend results -> UI
    setRiskScore(analysis.riskScore ?? 0);
    setRiskLevel(analysis.riskLevel ?? "LOW");
    setDetectedSignals(analysis.signals || []);

    // Status
    if (analysis.riskLevel === "CRITICAL") {
      setWarning(true);
      setStatus("Potential fraud detected");

      if (!safePause && !sosActive && !guardianAlerted) {
        startSafePause();
      }
    } else if (analysis.riskLevel === "HIGH") {
      setWarning(true);
      setStatus("Suspicious conversation detected");
    } else if (analysis.riskLevel === "MEDIUM") {
      setWarning(false);
      setStatus("Suspicious signals detected");
    } else {
      setWarning(false);
      setStatus("Conversation appears safe");
    }
  } catch (error) {
    console.error("Call analysis error:", error);
    setError(error.message || "Unable to analyze conversation");
  }
};
  const startRecognition = async () => {
  try {
    // ==========================================
    // ANDROID NATIVE SPEECH RECOGNITION
    // ==========================================
    if (Capacitor.isNativePlatform()) {
      setError("");
      setStatus("Requesting microphone permission...");

      const permission =
        await SpeechRecognition.requestPermissions();

      if (permission.speechRecognition !== "granted") {
        setError(
          "Microphone permission was denied. Please allow microphone access."
        );
        setListening(false);
        return;
      }

      const available =
        await SpeechRecognition.available();

      if (!available.available) {
        setError(
          "Speech recognition is not available on this device."
        );
        setListening(false);
        return;
      }

      // Remove old listener before adding a new one
      await SpeechRecognition.removeAllListeners();

      
        await SpeechRecognition.addListener(
  "partialResults",
  (data) => {
    if (!data.matches || data.matches.length === 0) {
      return;
    }

    const spokenText = data.matches[0]?.trim();

    if (!spokenText) {
      return;
    }

    // Show detected speech immediately
    setTranscript(spokenText);

    // Analyze every recognized phrase
    analyzeSpeech(spokenText);
  }
);

      await SpeechRecognition.addListener(
        "listeningState",
        (data) => {
          setListening(data.status === "started");
        }
      );

      setListening(true);
      setStatus("AI is listening...");

      await SpeechRecognition.start({
        language: "en-IN",
        maxResults: 5,
        prompt: "Cyber Shield AI is listening",
        partialResults: true,
        popup: false,
      });

      return;
    }

    // ==========================================
    // WEB BROWSER SPEECH RECOGNITION
    // ==========================================

    const BrowserSpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!BrowserSpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    const recognition =
      new BrowserSpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setListening(true);
      setError("");
      setStatus("AI is listening...");
    };

    recognition.onresult = (event) => {
      let finalText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const text =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += `${text} `;
        }
      }

      if (finalText.trim()) {
        setTranscript((current) => {
          const updated =
            `${current} ${finalText}`.trim();

          analyzeSpeech(updated);

          return updated;
        });
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Please allow microphone access."
        );
      } else {
        setError(
          `Speech recognition error: ${event.error}`
        );
      }

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  } catch (error) {
    console.error(
      "Start speech recognition error:",
      error
    );

    setListening(false);

    setError(
      error?.message ||
        "Unable to start microphone / speech recognition."
    );
  }
};

  const stopRecognition = async () => {
  try {
    // ANDROID NATIVE
    if (Capacitor.isNativePlatform()) {
      try {
        await SpeechRecognition.stop();
      } catch (error) {
        console.log("Native speech stop warning:", error);
      }

      try {
        await SpeechRecognition.removeAllListeners();
      } catch (error) {
        console.log("Listener cleanup warning:", error);
      }

      setListening(false);
      return;
    }

    // WEB
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setListening(false);
  } catch (error) {
    console.error("Stop speech recognition error:", error);
    setListening(false);
  }
};

  const startMonitoring = () => {
    setMonitoring(true);
    setTranscript("");
    setDetectedSignals([]);
    setRiskScore(8);
    setRiskLevel("LOW");
    setWarning(false);
    setSosActive(false);
    setSafePause(false);
    setGuardianAlerted(false);
    setCountdown(10);
    setError("");
    setStatus("Starting AI protection...");

    setTimeout(() => {
      startRecognition();
    }, 500);
  };
  const simulateScamCall = () => {
  const demoText =
    "This is urgent. Tell me your OTP and UPI PIN and transfer money immediately.";

  setTranscript(demoText);
  analyzeSpeech(demoText);
};

  const stopMonitoring = () => {
    stopRecognition();

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setMonitoring(false);
    setWarning(false);
    setSafePause(false);
    setStatus("Monitoring stopped");
  };

  // SAFE PAUSE
  const startSafePause = () => {
    setSafePause(true);
    setCountdown(10);
    setStatus("Safety pause activated");

    stopRecognition();

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    let seconds = 10;

    countdownRef.current = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);

      
        if (seconds <= 0) {
  clearInterval(countdownRef.current);

  setStatus("Critical fraud detected — activating emergency protection...");

  // Automatically activate SOS
  activateSOS();

  // Automatically alert trusted contact / sister
  setTimeout(() => {
    alertTrustedContact();
  }, 800);
}
    }, 1000);
  };

  const continueMonitoring = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setSafePause(false);
    setCountdown(10);
    setStatus("Monitoring resumed");

    setTimeout(() => {
      startRecognition();
    }, 300);
  };

 const activateSOS = async () => {
  try {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setStatus("Activating emergency SOS...");
    setError("");

    const response = await fetch(
      `${API_BASE_URL}/call-monitoring/sos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          riskScore,
          riskLevel,
          transcript,
          callerOrSender: "",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to activate SOS"
      );
    }

    setSosActive(true);
    setSafePause(false);
    setWarning(false);

    stopRecognition();

    setStatus("Emergency SOS activated");

    console.log(
      "🚨 SOS backend event created:",
      data.event
    );
  } catch (error) {
    console.error("SOS activation error:", error);

    setError(
      error.message || "Unable to activate SOS"
    );
  }
};

  const alertTrustedContact = async () => {
  console.log("🔥 GUARDIAN BUTTON CLICKED");

  try {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setStatus("Alerting trusted contact...");
    setError("");

    const response = await fetch(
      `${API_BASE_URL}/call-monitoring/guardian-alert`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          riskScore,
          riskLevel,
          transcript,
          callerOrSender: "",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to alert trusted contact"
      );
    }

    setAlertedGuardian(data.guardian || null);
    setGuardianAlerted(true);
    setSafePause(false);
    setWarning(false);

    stopRecognition();

    setStatus("Trusted contact alerted");

    console.log(
      "🛡️ Guardian alert backend event created:",
      data.event
    );
  } catch (error) {
    console.error("Guardian alert error:", error);

    setError(
      error.message || "Unable to alert trusted contact"
    );
  }
};

  const endCall = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    stopRecognition();

    setMonitoring(false);
    setWarning(false);
    setSafePause(false);
    setSosActive(false);

    setStatus("Call monitoring ended");
  };
  useEffect(() => {
  const shouldAutoStart =
    localStorage.getItem("cyber_auto_start_monitoring");

  if (shouldAutoStart === "true") {
    // Remove immediately so normal page visits don't auto-start again
    localStorage.removeItem("cyber_auto_start_monitoring");

    setStatus("Incoming call detected — starting AI protection...");

    setTimeout(() => {
      startMonitoring();
    }, 700);
  }
}, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const getRiskColor = () => {
    if (riskLevel === "CRITICAL") return "text-red-600";
    if (riskLevel === "HIGH") return "text-orange-600";
    if (riskLevel === "MEDIUM") return "text-amber-600";
    return "text-green-600";
  };

  const getRiskBg = () => {
    if (riskLevel === "CRITICAL") return "bg-red-50";
    if (riskLevel === "HIGH") return "bg-orange-50";
    if (riskLevel === "MEDIUM") return "bg-amber-50";
    return "bg-green-50";
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* INCOMING PROTECTED CALL POPUP */}
{incomingProtectedCall && (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <PhoneCall size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Incoming Protected Call
          </h2>

          <p className="text-sm text-gray-500">
            {protectedCallerId || "Unknown Protected Caller"}
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-xl bg-blue-50 p-3">
        <p className="text-sm font-medium text-blue-900">
          Enable AI Protection for this call?
        </p>

        <p className="mt-1 text-xs text-blue-700">
          Cyber Shield will analyze the protected call for fraud signals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleRejectProtectedCall}
          className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700"
        >
          NO
        </button>

        <button
          onClick={handleAcceptProtectedCall}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
        >
          YES
        </button>
      </div>

    </div>
  </div>
)}

      {/* HEADER */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <PhoneCall size={19} />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
            AI Voice Protection
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Live Call Monitoring
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          AI analyzes conversation signals to detect potential phone scams.
        </p>
      </section>
      {/* PROTECTED CALL ID */}
<section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
      <ShieldCheck size={18} />
    </div>

    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
        Protected Call ID
      </p>

      <p className="font-mono text-sm font-bold text-gray-900">
        {myProtectedCallId || "Connecting..."}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        Use this ID to receive a Cyber Shield Protected Call.
      </p>
    </div>
  </div>
</section>

      {/* MAIN STATUS */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 text-white shadow-xl">

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <PhoneCall size={27} />

              {monitoring && (
                <span className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-blue-800 bg-green-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">
                  AI Voice Shield
                </h2>

                <span className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-bold">
                  {monitoring ? "ACTIVE" : "STANDBY"}
                </span>
              </div>

              <p className="mt-1 text-[10px] text-blue-200">
                {status}
              </p>
            </div>
          </div>

          {!monitoring ? (
            <button
              onClick={startMonitoring}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-blue-800 shadow-lg transition hover:bg-blue-50"
            >
              <ShieldCheck size={15} />
              Start AI Protection
            </button>
          ) : (
            <button
              onClick={stopMonitoring}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-xs font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <ShieldAlert size={15} />
              Stop Monitoring
            </button>
          )}
          {monitoring && (
  <button
    onClick={simulateScamCall}
    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-[10px] font-bold text-white shadow-lg hover:bg-red-700"
  >
    <Siren size={15} />
    Simulate Scam Call
  </button>
)}

        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="text-xs font-bold text-red-700">
              Microphone / Speech Recognition Issue
            </p>

            <p className="mt-1 text-[10px] leading-4 text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* FRAUD WARNING */}
      {warning && riskScore >= 45 && !sosActive && !safePause && !guardianAlerted && (
        <section
          className={`rounded-3xl border p-5 shadow-lg ${
            riskLevel === "CRITICAL"
              ? "border-red-200 bg-red-50"
              : "border-orange-200 bg-orange-50"
          }`}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  riskLevel === "CRITICAL"
                    ? "bg-red-100 text-red-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                <ShieldAlert size={24} />
              </div>

              <div>
                <p
                  className={`text-sm font-bold ${
                    riskLevel === "CRITICAL"
                      ? "text-red-700"
                      : "text-orange-700"
                  }`}
                >
                  {riskLevel === "CRITICAL"
                    ? "Potential Fraud Detected"
                    : "Suspicious Conversation Detected"}
                </p>

                <p
                  className={`mt-1 max-w-xl text-[10px] leading-5 ${
                    riskLevel === "CRITICAL"
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  AI detected suspicious language patterns commonly
                  associated with social engineering or financial scams.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={endCall}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-[10px] font-bold text-white hover:bg-slate-800"
              >
                <PhoneOff size={14} />
                End Call
              </button>

              <button
                onClick={startSafePause}
                className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-[10px] font-bold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800"
              >
                <PauseCircle size={14} />
                Safe Pause
              </button>
            </div>

          </div>
        </section>
      )}

      {/* SAFE PAUSE */}
      {safePause && !sosActive && (
        <section className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-xl">

          <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white">

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <PauseCircle size={26} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold">
                    Safe Pause Activated
                  </h2>

                  <span className="rounded-full bg-white/10 px-2 py-1 text-[8px] font-bold">
                    PROTECT
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-blue-100">
                  The conversation has been temporarily paused for your safety.
                </p>
              </div>
            </div>

          </div>

          <div className="p-5">

            <div className="grid gap-5 md:grid-cols-[1fr_160px]">

              <div>
                <div className="flex items-start gap-3">
                  <ShieldAlert
                    size={17}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      High-risk conversation detected
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-slate-500">
                      AI detected multiple suspicious signals. Do not share
                      OTPs, PINs, passwords, banking information or transfer
                      money while the call is under review.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {detectedSignals.slice(0, 4).map((signal) => (
                    <span
                      key={signal.label}
                      className="rounded-full bg-red-50 px-3 py-1.5 text-[9px] font-semibold text-red-600"
                    >
                      {signal.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* COUNTDOWN */}
              <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-50 p-4 text-center">

                <Clock3
                  size={18}
                  className="text-blue-700"
                />

                <p className="mt-2 text-[9px] font-semibold uppercase tracking-wider text-blue-500">
                  Safety Pause
                </p>

                <p className="mt-1 text-3xl font-bold text-blue-700">
                  {countdown}s
                </p>

                <p className="mt-1 text-[8px] text-blue-500">
                  Take a moment
                </p>

              </div>

            </div>

            {/* ACTIONS */}
            <div className="mt-5 grid gap-2 sm:grid-cols-3">

              <button
                onClick={endCall}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-[10px] font-bold text-white transition hover:bg-slate-800"
              >
                <PhoneOff size={14} />
                End Call
              </button>

              <button
                onClick={alertTrustedContact}
                disabled={guardianAlerted}
                className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[10px] font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
              >
                <Users size={14} />
                Alert Trusted Contact
              </button>

              <button
                onClick={activateSOS}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-[10px] font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
              >
                <Siren size={14} />
                Activate SOS
              </button>

            </div>

            <button
              onClick={continueMonitoring}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <CheckCircle2 size={14} />
              I'm Safe — Resume Monitoring
            </button>

          </div>
        </section>
      )}

      {/* GUARDIAN ALERT SENT */}
      {guardianAlerted && !sosActive && (
        <section className="rounded-3xl border border-green-200 bg-green-50 p-5 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                <BellRing size={23} />
              </div>

              <div>
                <p className="text-sm font-bold text-green-700">
                  Guardian Alert Sent
                </p>

                <p className="mt-1 text-sm text-green-700">
  {alertedGuardian ? (
    <>
      Alert sent to{" "}
      <span className="font-bold">
        {alertedGuardian.name}
      </span>

      {alertedGuardian.relationship && (
        <>
          {" "}({alertedGuardian.relationship})
        </>
      )}

      {alertedGuardian.phone && (
        <>
          {" "}at{" "}
          <span className="font-bold">
            {alertedGuardian.phone}
          </span>
        </>
      )}

      . The detected risk level was{" "}
      <span className="font-bold">
        {riskScore}/100
      </span>.
    </>
  ) : (
    <>
      Your trusted contact has been notified about this suspicious
      conversation. The detected risk level was{" "}
      <span className="font-bold">
        {riskScore}/100
      </span>.
    </>
  )}
</p>
              </div>
            </div>

            <button
              onClick={endCall}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-[10px] font-bold text-white hover:bg-slate-800"
            >
              <PhoneOff size={14} />
              End Call
            </button>

          </div>
        </section>
      )}

      {/* SOS ACTIVE */}
      {sosActive && (
        <section className="rounded-3xl bg-red-600 p-6 text-white shadow-xl shadow-red-600/20">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-white/15">
                <Siren size={25} />
              </div>

              <div>
                <p className="text-sm font-bold">
                  Emergency SOS Activated
                </p>

                <p className="mt-1 text-[10px] text-red-100">
                  Emergency workflow has been triggered.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSosActive(false);
                setStatus("SOS cancelled");
              }}
              className="rounded-xl bg-white px-5 py-3 text-[10px] font-bold text-red-600"
            >
              Cancel SOS
            </button>

          </div>
        </section>
      )}

      {/* ANALYTICS */}
      <section className="grid gap-5 md:grid-cols-3">

        {/* RISK */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AI Risk Score
              </p>

              <p className={`mt-2 text-3xl font-bold ${getRiskColor()}`}>
                {riskScore}
                <span className="text-sm text-slate-400">
                  /100
                </span>
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${getRiskBg()} ${getRiskColor()}`}
            >
              <Activity size={20} />
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                riskLevel === "CRITICAL"
                  ? "bg-red-600"
                  : riskLevel === "HIGH"
                  ? "bg-orange-500"
                  : riskLevel === "MEDIUM"
                  ? "bg-amber-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${riskScore}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[9px] text-slate-400">
              Risk level
            </span>

            <span
              className={`text-[10px] font-bold ${getRiskColor()}`}
            >
              {riskLevel}
            </span>
          </div>
        </div>

        {/* VOICE */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Voice Analysis
              </p>

              <p className="mt-2 text-sm font-bold text-slate-800">
                {listening ? "Listening..." : "Standby"}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                listening
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {listening ? (
                <Mic size={20} />
              ) : (
                <MicOff size={20} />
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
              <span
                key={bar}
                className={`h-6 flex-1 rounded-full ${
                  listening
                    ? "animate-pulse bg-blue-200"
                    : "bg-slate-100"
                }`}
                style={{
                  animationDelay: `${bar * 70}ms`,
                }}
              />
            ))}
          </div>

          <p className="mt-3 text-[9px] text-slate-400">
            Speech patterns are analyzed locally in this demo.
          </p>
        </div>

        {/* DETECTIONS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Threat Signals
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {detectedSignals.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <BrainCircuit size={20} />
            </div>
          </div>

          <p className="mt-5 text-[9px] text-slate-400">
            Suspicious patterns detected during the conversation.
          </p>
        </div>
      </section>

      {/* TRANSCRIPT + SIGNALS */}
      <section className="grid gap-5 lg:grid-cols-[1fr_330px]">

        {/* TRANSCRIPT */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Volume2 size={17} />
              </div>

              <div>
                <h2 className="text-xs font-bold text-slate-900">
                  Live Voice Transcript
                </h2>

                <p className="mt-1 text-[9px] text-slate-400">
                  AI speech recognition output
                </p>
              </div>
            </div>

            {listening && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600">
                <Radio size={12} />
                LIVE
              </div>
            )}

          </div>

          <div className="mt-5 min-h-[180px] rounded-2xl bg-slate-50 p-5">

            {transcript ? (
              <p className="text-xs leading-6 text-slate-600">
                {transcript}
              </p>
            ) : (
              <div className="flex min-h-[140px] flex-col items-center justify-center text-center">
                <Mic
                  size={25}
                  className="text-slate-300"
                />

                <p className="mt-3 text-xs font-semibold text-slate-500">
                  No speech detected yet
                </p>

                <p className="mt-1 max-w-sm text-[9px] leading-4 text-slate-400">
                  Start AI Protection and speak into your microphone to
                  simulate a monitored conversation.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* SIGNALS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ShieldAlert size={17} />
            </div>

            <div>
              <h2 className="text-xs font-bold text-slate-900">
                Detected Signals
              </h2>

              <p className="mt-1 text-[9px] text-slate-400">
                AI threat indicators
              </p>
            </div>

          </div>

          <div className="mt-5 space-y-2">

            {detectedSignals.length === 0 ? (
              <div className="rounded-2xl bg-green-50 p-4">

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={15}
                    className="text-green-600"
                  />

                  <p className="text-[10px] font-bold text-green-700">
                    No suspicious signals
                  </p>
                </div>

                <p className="mt-2 text-[9px] leading-4 text-green-600">
                  AI has not detected suspicious fraud patterns yet.
                </p>

              </div>
            ) : (
              detectedSignals.map((signal) => (
                <div
                  key={signal.label}
                  className="flex items-center justify-between rounded-xl bg-red-50 px-3 py-3"
                >

                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={13}
                      className="text-red-500"
                    />

                    <span className="text-[10px] font-semibold text-red-700">
                      {signal.label}
                    </span>
                  </div>

                  <span className="text-[9px] font-bold text-red-500">
                    +{signal.weight}
                  </span>

                </div>
              ))
            )}

          </div>
        </div>
      </section>

      {/* SAFETY NOTE */}
      <section className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">

        <LockKeyhole
          size={16}
          className="mt-0.5 shrink-0 text-blue-700"
        />

        <p className="text-[9px] leading-5 text-blue-700">
          <span className="font-bold">Privacy note:</span> This prototype
          uses browser speech recognition for demonstration. A production
          mobile version should process call audio through a properly
          permissioned native call-monitoring system.
        </p>

      </section>

    </div>
  );
}

export default LiveCallMonitoring;