import { useState } from "react";
import {
  Link2,
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Globe,
  Lock,
  Zap,
} from "lucide-react";

function LinkScanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const scanLink = () => {
    if (!url.trim()) return;

    setScanning(true);
    setResult(null);

    setTimeout(() => {
      const suspicious =
        url.toLowerCase().includes("login") ||
        url.toLowerCase().includes("verify") ||
        url.toLowerCase().includes("free") ||
        url.toLowerCase().includes("claim") ||
        url.toLowerCase().includes("urgent");

      setResult({
        safe: !suspicious,
        score: suspicious ? 18 : 94,
        title: suspicious
          ? "Potentially Unsafe Link"
          : "Link Appears Safe",
        description: suspicious
          ? "This URL contains patterns commonly associated with phishing or suspicious websites."
          : "No major phishing or suspicious patterns were detected in this URL.",
      });

      setScanning(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      scanLink();
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Link2 size={19} />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
            Web Protection
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Safe Link Scanner
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Check suspicious URLs before opening them.
        </p>
      </div>

      {/* Scanner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <ShieldCheck size={32} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Is this link safe?
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Paste a suspicious website URL and let Cyber Shield analyze it.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
              <Globe size={19} className="shrink-0 text-slate-400" />

              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={scanLink}
              disabled={!url.trim() || scanning}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search size={17} />
                  Scan Link
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock size={13} />
              No browsing required
            </span>

            <span className="flex items-center gap-1.5">
              <Zap size={13} />
              AI-powered analysis
            </span>
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
          <div
            className={`flex items-center justify-between gap-4 px-6 py-5 ${
              result.safe
                ? "bg-green-50"
                : "bg-red-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  result.safe
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {result.safe ? (
                  <CheckCircle2 size={25} />
                ) : (
                  <XCircle size={25} />
                )}
              </div>

              <div>
                <p
                  className={`text-sm font-bold ${
                    result.safe
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {result.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Analysis completed
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">
                {result.score}
              </p>

              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Safety Score
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex gap-3">
              <AlertTriangle
                size={18}
                className={
                  result.safe
                    ? "text-green-600"
                    : "text-red-600"
                }
              />

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  AI Analysis
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {result.description}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Scanned URL
              </p>

              <p className="mt-1 break-all text-sm font-medium text-slate-700">
                {url}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      {!result && (
        <div>
          <div className="mb-4">
            <h3 className="font-bold text-slate-900">
              How it works
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Cyber Shield checks multiple risk signals before showing a result.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Globe size={18} />
              </div>

              <h4 className="mt-4 text-sm font-bold text-slate-800">
                URL Analysis
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Checks domain and URL patterns for suspicious signals.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <AlertTriangle size={18} />
              </div>

              <h4 className="mt-4 text-sm font-bold text-slate-800">
                Threat Detection
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Identifies common phishing and scam indicators.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700">
                <ShieldCheck size={18} />
              </div>

              <h4 className="mt-4 text-sm font-bold text-slate-800">
                Safety Score
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Get a simple risk score before visiting the website.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LinkScanner;