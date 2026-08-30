import { useState } from "react";
import {
  ShieldCheck,
  PhoneCall,
  Link2,
  Smartphone,
  BrainCircuit,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  LockKeyhole,
} from "lucide-react";

function SafetyMeter() {
  const [score, setScore] = useState(92);
  const [checking, setChecking] = useState(false);

  const runSafetyCheck = () => {
    setChecking(true);

    setTimeout(() => {
      const newScore = Math.floor(88 + Math.random() * 11);
      setScore(newScore);
      setChecking(false);
    }, 1800);
  };

  const getRisk = () => {
    if (score >= 85) {
      return {
        label: "Low Risk",
        text: "Your digital environment is currently well protected.",
        color: "text-green-600",
        bg: "bg-green-50",
        dot: "bg-green-500",
      };
    }

    if (score >= 65) {
      return {
        label: "Moderate Risk",
        text: "A few security improvements are recommended.",
        color: "text-amber-600",
        bg: "bg-amber-50",
        dot: "bg-amber-500",
      };
    }

    return {
      label: "High Risk",
      text: "Immediate security improvements are recommended.",
      color: "text-red-600",
      bg: "bg-red-50",
      dot: "bg-red-500",
    };
  };

  const risk = getRisk();

  const checks = [
    {
      name: "Call Safety",
      description: "Suspicious callers detected",
      value: "Protected",
      icon: PhoneCall,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      name: "Link Safety",
      description: "Unsafe links being blocked",
      value: "Protected",
      icon: Link2,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
    {
      name: "Device Safety",
      description: "Devices currently protected",
      value: "3 Devices",
      icon: Smartphone,
      color: "text-purple-700",
      bg: "bg-purple-50",
    },
    {
      name: "AI Detection",
      description: "Threat intelligence active",
      value: "Active",
      icon: BrainCircuit,
      color: "text-cyan-700",
      bg: "bg-cyan-50",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Activity size={19} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Live Security
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Safety Meter
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Understand your current digital safety level at a glance.
          </p>
        </div>

        <button
          onClick={runSafetyCheck}
          disabled={checking}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <RefreshCw
            size={15}
            className={checking ? "animate-spin" : ""}
          />

          {checking ? "Checking..." : "Run Safety Check"}
        </button>
      </div>

      {/* MAIN SCORE */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-7 text-white shadow-xl md:p-9">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

          {/* SCORE */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-white/10">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-green-400/80">
                <div>
                  <p className="text-3xl font-bold">
                    {score}
                  </p>

                  <p className="text-[9px] font-semibold text-blue-200">
                    / 100
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${risk.dot}`}
              />

              <span className="text-sm font-bold">
                {risk.label}
              </span>
            </div>

            <p className="mt-2 max-w-xs text-xs leading-5 text-blue-200">
              {risk.text}
            </p>
          </div>

          {/* ANALYSIS */}
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={19} />

              <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Security Analysis
              </p>
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Your digital protection is strong.
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-5 text-blue-200">
              Cyber Shield continuously evaluates your calls, links,
              devices and suspicious activity to calculate your safety score.
            </p>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-[10px] font-semibold">
                <span className="text-blue-200">
                  Protection strength
                </span>

                <span className="text-green-300">
                  {score}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-green-400 transition-all duration-700"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-semibold text-blue-100">
                ✓ Threat Detection
              </span>

              <span className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-semibold text-blue-100">
                ✓ Scam Protection
              </span>

              <span className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-semibold text-blue-100">
                ✓ AI Monitoring
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PROTECTION CHECKS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Protection Checks
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Current status of your security layers
            </p>
          </div>

          <LockKeyhole
            size={18}
            className="text-blue-700"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {checks.map((check) => {
            const Icon = check.icon;

            return (
              <div
                key={check.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${check.bg} ${check.color}`}
                  >
                    <Icon size={19} />
                  </div>

                  <CheckCircle2
                    size={17}
                    className="text-green-500"
                  />
                </div>

                <p className="mt-5 text-xs font-bold text-slate-800">
                  {check.name}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                  {check.description}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                  <span className="text-[10px] font-bold text-green-600">
                    {check.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RISK INSIGHTS */}
      <section className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">

        {/* INSIGHTS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <BrainCircuit size={20} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                AI Safety Insights
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Automated recommendations
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">

            <div className="flex gap-3 rounded-2xl bg-green-50 p-4">
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <div>
                <p className="text-xs font-bold text-green-700">
                  Strong protection
                </p>

                <p className="mt-1 text-[10px] leading-4 text-green-600">
                  Your major security layers are currently active.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-blue-50 p-4">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-blue-700"
              />

              <div>
                <p className="text-xs font-bold text-blue-700">
                  AI Guardian is active
                </p>

                <p className="mt-1 text-[10px] leading-4 text-blue-600">
                  Threat monitoring is running in the background.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-amber-50 p-4">
              <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="text-xs font-bold text-amber-700">
                  Stay alert
                </p>

                <p className="mt-1 text-[10px] leading-4 text-amber-600">
                  Never share OTPs, passwords or banking details with callers.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* SCORE BREAKDOWN */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900">
            Score Breakdown
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            How your score is calculated
          </p>

          <div className="mt-6 space-y-5">

            {[
              ["Call Protection", 96],
              ["Link Protection", 94],
              ["Device Security", 98],
              ["AI Monitoring", 91],
            ].map(([name, value]) => (
              <div key={name}>
                <div className="mb-2 flex justify-between">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {name}
                  </span>

                  <span className="text-[10px] font-bold text-slate-800">
                    {value}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}

          </div>

          <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 p-3">
            <Activity
              size={14}
              className="text-blue-700"
            />

            <span className="text-[10px] font-medium text-slate-500">
              Last checked just now
            </span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="flex items-center justify-center gap-2 pb-4 text-[10px] text-slate-400">
        <ShieldCheck size={12} />
        Cyber Shield AI continuously monitors your digital safety.
      </div>

    </div>
  );
}

export default SafetyMeter;