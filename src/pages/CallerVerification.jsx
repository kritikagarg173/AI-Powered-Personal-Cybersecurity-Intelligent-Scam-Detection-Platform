import { useState } from "react";
import {
  UserRoundCheck,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Clock,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "../services/apiConfig";

function CallerVerification() {
  const [phone, setPhone] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const verifyCaller = async () => {
  if (!phone.trim()) return;

  try {
    setVerifying(true);
    setResult(null);

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      throw new Error("User session not found. Please login again.");
    }

    const user = JSON.parse(storedUser);
    const userId = user.id || user._id || user.userId;

    if (!userId) {
      throw new Error("User ID not found. Please login again.");
    }

    const response = await fetch(
      `${API_BASE_URL}/caller-verification/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userId,
          phone,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Caller verification failed");
    }

    setResult(data.result);

    console.log("Caller verification response:", data);
  } catch (error) {
    console.error("Caller verification error:", error);

    setResult({
      safe: false,
      score: 0,
      status: "VERIFICATION FAILED",
      name: "Unable to Verify",
      description:
        error.message || "Unable to verify this caller at the moment.",
    });
  } finally {
    setVerifying(false);
  }
};

  const reset = () => {
    setPhone("");
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <UserRoundCheck size={19} />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
            Caller Protection
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Caller Verification
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Check a phone number for suspicious activity before trusting the caller.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Phone size={26} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Verify a phone number
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Enter the number you received a call from.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
              <Phone size={18} className="shrink-0 text-slate-400" />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    verifyCaller();
                  }
                }}
                placeholder="+91 98765 43210"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={verifyCaller}
              disabled={!phone.trim() || verifying}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search size={17} />
                  Verify Caller
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck size={13} />
            Your search is processed securely
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${
            result.safe
              ? "border-green-200"
              : "border-red-200"
          }`}
        >
          {/* Result Header */}
          <div
            className={`flex flex-col justify-between gap-5 px-6 py-6 md:flex-row md:items-center ${
              result.safe ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  result.safe
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {result.safe ? (
                  <CheckCircle2 size={28} />
                ) : (
                  <XCircle size={28} />
                )}
              </div>

              <div>
                <div
                  className={`text-xs font-bold ${
                    result.safe ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {result.status}
                </div>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {result.name}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">
                  {result.score}
                </p>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Safety Score
                </p>
              </div>

              <button
                onClick={reset}
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50"
                title="New verification"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Result Details */}
          <div className="grid gap-5 p-6 md:grid-cols-2">
            {/* Verification Summary */}
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-blue-700" />

                <h3 className="text-sm font-bold text-slate-800">
                  Verification Summary
                </h3>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                {result.description}
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={14} />
                    Number
                  </span>

                  <span className="text-xs font-semibold text-slate-700">
                    {phone}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={14} />
                    Region
                  </span>

                  <span className="text-xs font-semibold text-slate-700">
                    India
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={14} />
                    Checked
                  </span>

                  <span className="text-xs font-semibold text-slate-700">
                    Just now
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Signals */}
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  size={17}
                  className={
                    result.safe ? "text-green-600" : "text-red-600"
                  }
                />

                <h3 className="text-sm font-bold text-slate-800">
                  Risk Signals
                </h3>
              </div>

              <div className="mt-4 space-y-2">
                <div
                  className={`rounded-xl px-3 py-3 ${
                    result.safe ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold ${
                      result.safe ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {result.safe
                      ? "No major scam reports detected"
                      : "Identity could not be confidently verified"}
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 px-3 py-3">
                  <p className="text-xs font-semibold text-amber-700">
                    Never share OTP or banking credentials
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 px-3 py-3">
                  <p className="text-xs font-semibold text-blue-700">
                    Verify official identity before taking action
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="border-t border-slate-100 px-6 py-5">
            <div className="flex gap-3">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Safety Recommendation
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {result.safe
                    ? "The number appears low-risk, but avoid sharing sensitive information unless you independently verify the caller."
                    : "Do not share OTPs, passwords, card details or personal information. If the caller claims to represent an organization, contact that organization using its official number."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      {!result && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck size={19} className="text-blue-700" />

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              Identity Signals
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Analyze available information associated with a caller.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <AlertTriangle size={19} className="text-amber-600" />

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              Scam Indicators
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Highlight suspicious patterns and potential scam risks.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 size={19} className="text-green-600" />

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              Safety Guidance
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Get clear recommendations before interacting with a caller.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallerVerification;