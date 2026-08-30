import { useState } from "react";
import {
  ShieldAlert,
  Camera,
  Clock3,
  Phone,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Mic,
  Download,
  BellRing,
  X,
  Upload,
  Loader2,
  Sparkles,
} from "lucide-react";
import { API_BASE_URL } from "../services/apiConfig";

function ScreenshotAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [evidence, setEvidence] = useState(null);

  const [guardianAlerted, setGuardianAlerted] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // SELECT SCREENSHOT
  // ==========================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image screenshot.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Screenshot must be smaller than 10 MB.");
      return;
    }

    setError("");
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setAnalysis(null);
    setEvidence(null);
    setGuardianAlerted(false);
  };

  // ==========================================
  // ANALYZE SCREENSHOT
  // ==========================================

  const analyzeScreenshot = async () => {
    if (!selectedFile) {
      setError("Please select a screenshot first.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysis(null);
    setEvidence(null);
    setGuardianAlerted(false);

    try {
      // Get logged-in user ID
      const storedUser = localStorage.getItem("user");

      let userId = null;

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          userId =
            parsedUser?.id ||
            parsedUser?._id ||
            parsedUser?.user?.id ||
            parsedUser?.user?._id;
        } catch (error) {
          console.error("Could not parse stored user:", error);
        }
      }

      // Fallback if token/user structure is different
      if (!userId) {
        userId = localStorage.getItem("userId");
      }

      if (!userId) {
        setError(
          "User ID not found. Please login again before analyzing a screenshot."
        );
        setAnalyzing(false);
        return;
      }

      // FormData for image upload
      const formData = new FormData();

      formData.append("user", userId);
      formData.append("screenshot", selectedFile);

      const response = await fetch(
        `${API_BASE_URL}/screenshot/analyze`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Screenshot analysis failed."
        );
      }

      setAnalysis(data.analysis);
      setEvidence(data.evidence);
    } catch (error) {
      console.error("Screenshot analysis error:", error);

      setError(
        error.message ||
          "Something went wrong while analyzing the screenshot."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // ==========================================
  // CLEAR
  // ==========================================

  const clearEvidence = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setEvidence(null);
    setGuardianAlerted(false);
    setError("");
  };

  // ==========================================
  // RISK COLOR HELPERS
  // ==========================================

  const getRiskTextColor = () => {
    if (!analysis) return "text-slate-900";

    if (
      analysis.riskLevel === "HIGH" ||
      analysis.riskLevel === "CRITICAL"
    ) {
      return "text-red-600";
    }

    if (analysis.riskLevel === "MEDIUM") {
      return "text-amber-600";
    }

    return "text-green-600";
  };

  const getRiskBarColor = () => {
    if (!analysis) return "bg-slate-300";

    if (
      analysis.riskLevel === "HIGH" ||
      analysis.riskLevel === "CRITICAL"
    ) {
      return "bg-red-500";
    }

    if (analysis.riskLevel === "MEDIUM") {
      return "bg-amber-500";
    }

    return "bg-green-500";
  };

  const isHighRisk =
    analysis &&
    (analysis.riskLevel === "HIGH" ||
      analysis.riskLevel === "CRITICAL");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
          <ShieldAlert size={18} />
          AI Evidence Protection
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Evidence Capture
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Upload a suspicious screenshot and let AI analyze it for scam
          indicators.
        </p>
      </div>

      {/* Upload / Detection Banner */}
      {!analysis ? (
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-700 to-blue-900 p-5 text-white shadow-lg">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <ShieldAlert size={25} />
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-100">
                  AI Protection Status
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  {selectedFile
                    ? "Screenshot ready for analysis"
                    : "Waiting for suspicious activity"}
                </h2>

                <p className="mt-1 text-xs text-blue-100">
                  Upload a screenshot to detect phishing, scams and
                  suspicious activity.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                <Upload size={18} />

                {selectedFile ? "Change Screenshot" : "Upload Screenshot"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <button
                  onClick={analyzeScreenshot}
                  disabled={analyzing}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {analyzing ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Analyze Screenshot
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`rounded-2xl border p-5 ${
            isHighRisk
              ? "border-red-200 bg-red-50"
              : analysis.riskLevel === "MEDIUM"
              ? "border-amber-200 bg-amber-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isHighRisk
                  ? "bg-red-100 text-red-600"
                  : analysis.riskLevel === "MEDIUM"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {isHighRisk ? (
                <AlertTriangle size={23} />
              ) : (
                <CheckCircle2 size={23} />
              )}
            </div>

            <div className="flex-1">
              <p
                className={`text-xs font-bold uppercase tracking-wider ${getRiskTextColor()}`}
              >
                {analysis.riskLevel} Risk
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {isHighRisk
                  ? "Potential Scam Detected"
                  : "Screenshot Analysis Completed"}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {analysis.explanation}
              </p>
            </div>

            <button
              onClick={clearEvidence}
              className="rounded-lg p-2 text-slate-400 hover:bg-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">Analysis failed</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Evidence Overview */}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        {/* Evidence Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Captured Evidence
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Digital evidence analyzed by Cyber Shield AI
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              {evidence?.id
                ? `Evidence #${evidence.id}`
                : "Evidence Pending"}
            </div>
          </div>

          {!previewUrl ? (
            <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                  <Camera size={23} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  No evidence captured
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Upload a screenshot to begin AI analysis.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex min-h-[280px] items-center justify-center bg-slate-900 p-4">
                <img
                  src={previewUrl}
                  alt="Screenshot evidence"
                  className="max-h-[360px] max-w-full rounded-xl object-contain shadow-2xl"
                />
              </div>
            </div>
          )}

          {selectedFile && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-700">
                  {selectedFile.name}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <Camera size={15} className="text-slate-400" />
            </div>
          )}
        </div>

        {/* Risk Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI Risk Score
              </p>

              <div className="mt-2 flex items-end gap-1">
                <span
                  className={`text-4xl font-bold ${getRiskTextColor()}`}
                >
                  {analysis ? analysis.riskScore : "0"}
                </span>

                <span className="mb-1 text-sm text-slate-400">
                  /100
                </span>
              </div>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                analysis
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-50 text-slate-300"
              }`}
            >
              <ShieldAlert size={21} />
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getRiskBarColor()}`}
              style={{
                width: `${analysis?.riskScore || 0}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs">
            <span className="text-slate-400">
              Risk level
            </span>

            <span
              className={`font-bold ${getRiskTextColor()}`}
            >
              {analysis ? analysis.riskLevel : "LOW"}
            </span>
          </div>
        </div>
      </div>

      {/* Evidence Details */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Detected Signals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Detected Scam Signals
              </h2>

              <p className="text-xs text-slate-400">
                Signals identified by AI
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {analysis?.signals?.length > 0 ? (
              analysis.signals.map((signal, index) => (
                <div
                  key={`${signal}-${index}`}
                  className="flex items-center gap-3 rounded-xl bg-red-50 px-3 py-2.5"
                >
                  <AlertTriangle
                    size={15}
                    className="text-red-500"
                  />

                  <span className="text-xs font-medium text-slate-700">
                    {signal}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-green-50 px-4 py-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 size={17} />

                  <span className="text-sm font-semibold">
                    No suspicious signals detected
                  </span>
                </div>

                <p className="mt-1 text-xs text-green-600">
                  AI did not identify major scam indicators in
                  this screenshot.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Conversation Evidence */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Mic size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Screenshot Text Evidence
              </h2>

              <p className="text-xs text-slate-400">
                Suspicious text detected by AI
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              {analysis?.suspiciousText
                ? `“${analysis.suspiciousText}”`
                : "No suspicious text detected."}
            </p>

            {analysis && (
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <Clock3 size={13} />
                AI analysis completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Explanation */}
      {analysis && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Sparkles size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                AI Security Assessment
              </h2>

              <p className="text-xs text-slate-400">
                Cyber Shield AI analysis
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-600">
              {analysis.explanation}
            </p>

            {analysis.recommendation && (
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recommendation
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {analysis.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evidence Metadata */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">
          Incident Details
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            icon={Phone}
            label="Sender / Caller"
            value={
              analysis?.callerOrSender || "Not detected"
            }
          />

          <Detail
            icon={Clock3}
            label="Timestamp"
            value={
              evidence?.createdAt
                ? new Date(
                    evidence.createdAt
                  ).toLocaleString()
                : "—"
            }
          />

          <Detail
            icon={ShieldAlert}
            label="Risk Score"
            value={
              analysis
                ? `${analysis.riskScore} / 100`
                : "—"
            }
          />

          <Detail
            icon={FileText}
            label="Incident ID"
            value={evidence?.id || "—"}
          />
        </div>
      </div>

      {/* Actions */}
      {analysis && (
        <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <Users size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Guardian Protection
              </p>

              <p className="text-xs text-slate-500">
                Notify your trusted contact about this incident.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGuardianAlerted(true)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                guardianAlerted
                  ? "bg-green-600 text-white"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              }`}
            >
              {guardianAlerted ? (
                <>
                  <CheckCircle2 size={16} />
                  Guardian Alerted
                </>
              ) : (
                <>
                  <BellRing size={16} />
                  Alert Guardian
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Download size={16} />
              Incident Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={14} />

        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

export default ScreenshotAnalyzer;