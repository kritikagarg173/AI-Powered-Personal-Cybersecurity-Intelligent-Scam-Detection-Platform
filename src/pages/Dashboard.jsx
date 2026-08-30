import {
  useEffect,
  useState,
} from "react";

import {
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  Link2,
  ArrowUpRight,
  Activity,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  getDashboardOverview,
  runSecurityScan,
} from "../services/dashboardService";


function Dashboard() {

  // ==========================================
  // STATE
  // ==========================================

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [scanning, setScanning] =
    useState(false);

  const [scanResult, setScanResult] =
    useState(null);


  // ==========================================
  // GET USER NAME
  // ==========================================

  let userName = "User";

  try {

    const storedUser =
      JSON.parse(
        localStorage.getItem("user")
      );

    if (storedUser?.name) {

      userName =
        storedUser.name;

    }

  } catch (error) {

    console.error(
      "User parse error:",
      error
    );

  }


  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  const loadDashboard =
    async () => {

      try {

        setLoading(true);

        setError("");


        const data =
          await getDashboardOverview();


        setDashboard(
          data.dashboard
        );

      } catch (error) {

        console.error(
          "Dashboard Load Error:",
          error
        );


        setError(
          error.message ||
          "Failed to load dashboard"
        );

      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    loadDashboard();

  }, []);


  // ==========================================
  // RUN SECURITY SCAN
  // ==========================================

  const handleSecurityScan =
    async () => {

      try {

        setScanning(true);

        setError("");

        setScanResult(null);


        const data =
          await runSecurityScan();


        setScanResult(
          data.scan
        );


        // Refresh dashboard after scan

        await loadDashboard();

      } catch (error) {

        console.error(
          "Security Scan Error:",
          error
        );


        setError(
          error.message ||
          "Security scan failed"
        );

      } finally {

        setScanning(false);

      }

    };


  // ==========================================
  // RELATIVE TIME
  // ==========================================

  const getRelativeTime =
    (dateValue) => {

      if (!dateValue) {

        return "Recently";

      }


      const date =
        new Date(dateValue);


      const diff =
        Date.now() -
        date.getTime();


      const minutes =
        Math.floor(
          diff /
          60000
        );


      if (minutes < 1) {

        return "Just now";

      }


      if (minutes < 60) {

        return `${minutes} min ago`;

      }


      const hours =
        Math.floor(
          minutes / 60
        );


      if (hours < 24) {

        return `${hours} hr${
          hours === 1 ? "" : "s"
        } ago`;

      }


      const days =
        Math.floor(
          hours / 24
        );


      return `${days} day${
        days === 1 ? "" : "s"
      } ago`;

    };


  // ==========================================
  // DASHBOARD VALUES
  // ==========================================

  const securityScore =
    dashboard?.securityScore ?? 100;


  const securityStatus =
    dashboard?.securityStatus ??
    "Protected";


  const backendStats =
    dashboard?.stats || {};


  const chartData =
    dashboard?.weeklyActivity ||
    [];


  const alerts =
    dashboard?.recentActivity ||
    [];


  // ==========================================
  // STAT CARDS
  // ==========================================

  const stats = [

    {

      title:
        "Security Events",

      value:
        backendStats.totalEvents ??
        0,

      change:
        "Live",

      icon:
        ShieldCheck,

      description:
        "Total monitored events",

    },

    {

      title:
        "Calls Monitored",

      value:
        backendStats.callsMonitored ??
        0,

      change:
        "Live",

      icon:
        PhoneCall,

      description:
        "AI monitored calls",

    },

    {

      title:
        "Scams Blocked",

      value:
        backendStats.scamsBlocked ??
        0,

      change:
        "Live",

      icon:
        AlertTriangle,

      description:
        "High-risk calls prevented",

    },

    {

      title:
        "Unsafe Links",

      value:
        backendStats.unsafeLinks ??
        0,

      change:
        "Live",

      icon:
        Link2,

      description:
        "Suspicious links detected",

    },

  ];


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="flex min-h-[400px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-4 text-sm font-semibold text-slate-500">

            Loading security dashboard...

          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="space-y-7">


      {/* ERROR */}

      {error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-semibold text-red-600">

            {error}

          </p>

        </div>

      )}


      {/* HEADER */}

      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>

          <p className="mb-2 text-sm font-semibold text-blue-600">

            CYBER SHIELD AI

          </p>


          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">

            Good morning, {userName} 👋

          </h1>


          <p className="mt-2 text-sm text-slate-500">

            Your digital environment is being monitored and protected.

          </p>

        </div>


        <button
          onClick={handleSecurityScan}
          disabled={scanning}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >

          <Activity
            size={17}
            className={
              scanning
                ? "animate-spin"
                : ""
            }
          />

          {scanning
            ? "Scanning..."
            : "Run Security Scan"}

        </button>

      </section>


      {/* SCAN RESULT */}

      {scanResult && (

        <section className="rounded-2xl border border-green-200 bg-green-50 p-5">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <div className="flex items-center gap-2">

                <CheckCircle2
                  size={20}
                  className="text-green-600"
                />

                <h3 className="font-bold text-green-800">

                  Security Scan Completed

                </h3>

              </div>


              <p className="mt-2 text-xs text-green-700">

                {scanResult.checksCompleted} of{" "}
                {scanResult.totalChecks} protection checks completed.

              </p>


              <p className="mt-1 text-xs text-green-700">

                Threats detected:{" "}
                <strong>
                  {scanResult.threatsDetected}
                </strong>

              </p>

            </div>


            <div className="text-right">

              <p className="text-3xl font-bold text-green-700">

                {scanResult.securityScore}

              </p>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600">

                Security Score

              </p>

            </div>

          </div>

        </section>

      )}


      {/* SECURITY STATUS */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-700 to-blue-900 p-6 text-white shadow-xl shadow-blue-900/10 md:p-7">

        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />


        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">

          <div>

            <div className="mb-4 flex items-center gap-2">

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">

                <ShieldCheck size={18} />

              </span>


              <span className="text-sm font-medium text-blue-100">

                Overall Security Status

              </span>

            </div>


            <h2 className="text-3xl font-bold md:text-4xl">

              {securityScore >= 75
                ? "You're Protected"
                : securityScore >= 50
                ? "Attention Recommended"
                : "Security Risk Detected"}

            </h2>


            <p className="mt-2 max-w-xl text-sm text-blue-100">

              {securityStatus} • Your security score is dynamically calculated from monitored security events.

            </p>

          </div>


          <div className="flex items-center gap-5">

            <div className="flex h-28 w-28 items-center justify-center rounded-full border-[8px] border-white/20 border-t-white">

              <div className="text-center">

                <p className="text-3xl font-bold">

                  {securityScore}

                </p>

                <p className="text-[10px] text-blue-100">

                  SCORE

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* STATS */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map(
          (stat) => {

            const Icon =
              stat.icon;


            return (

              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >

                <div className="flex items-start justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">

                    <Icon
                      size={20}
                    />

                  </div>


                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600">

                    <ArrowUpRight
                      size={12}
                    />

                    {stat.change}

                  </span>

                </div>


                <p className="mt-5 text-xs font-medium text-slate-500">

                  {stat.title}

                </p>


                <p className="mt-1 text-2xl font-bold text-slate-900">

                  {stat.value}

                </p>


                <p className="mt-1 text-[11px] text-slate-400">

                  {stat.description}

                </p>

              </div>

            );

          }
        )}

      </section>


      {/* CHART + ALERTS */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">


        {/* THREAT ACTIVITY */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-bold text-slate-900">

                Threat Activity

              </h3>


              <p className="mt-1 text-xs text-slate-400">

                Security events detected during the last 7 days

              </p>

            </div>


            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-semibold text-green-600">

              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

              Monitoring

            </span>

          </div>


          <div className="mt-5 h-[240px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={chartData}
              >

                <defs>

                  <linearGradient
                    id="threatGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#2563eb"
                      stopOpacity={0.25}
                    />

                    <stop
                      offset="100%"
                      stopColor="#2563eb"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>


                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill:
                      "#94a3b8",
                  }}
                />


                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 11,
                    fill:
                      "#94a3b8",
                  }}
                />


                <Tooltip />


                <Area
                  type="monotone"
                  dataKey="threats"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#threatGradient)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* RECENT ALERTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div>

            <h3 className="font-bold text-slate-900">

              Recent Alerts

            </h3>


            <p className="mt-1 text-xs text-slate-400">

              Latest security activity

            </p>

          </div>


          <div className="mt-5 space-y-3">

            {alerts.length > 0 ? (

              alerts.map(
                (alert) => {

                  const isHigh =
                    alert.riskLevel ===
                      "HIGH" ||
                    alert.riskLevel ===
                      "CRITICAL";


                  const isCall =
                    alert.type ===
                    "SCAM_CALL";


                  return (

                    <div
                      key={alert.id}
                      className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                    >

                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isHigh
                            ? "bg-red-50 text-red-600"
                            : isCall
                            ? "bg-amber-50 text-amber-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >

                        {isHigh ? (

                          <AlertTriangle
                            size={17}
                          />

                        ) : isCall ? (

                          <PhoneCall
                            size={17}
                          />

                        ) : (

                          <CheckCircle2
                            size={17}
                          />

                        )}

                      </div>


                      <div className="min-w-0 flex-1">

                        <p className="text-xs font-semibold leading-4 text-slate-800">

                          {alert.title}

                        </p>


                        {alert.description && (

                          <p className="mt-1 line-clamp-2 text-[10px] text-slate-400">

                            {alert.description}

                          </p>

                        )}


                        <div className="mt-2 flex items-center justify-between gap-2">

                          <span className="text-[10px] font-medium text-slate-400">

                            {getRelativeTime(
                              alert.createdAt
                            )}

                          </span>


                          <span
                            className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                              isHigh
                                ? "bg-red-50 text-red-600"
                                : alert.riskLevel === "MEDIUM"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-green-50 text-green-600"
                            }`}
                          >

                            {alert.riskLevel ||
                              "LOW"}

                          </span>

                        </div>

                      </div>

                    </div>

                  );

                }
              )

            ) : (

              <div className="rounded-xl bg-green-50 p-5 text-center">

                <CheckCircle2
                  size={24}
                  className="mx-auto text-green-600"
                />

                <p className="mt-2 text-xs font-bold text-green-700">

                  No recent threats

                </p>

                <p className="mt-1 text-[10px] text-green-600">

                  Your account is currently secure.

                </p>

              </div>

            )}

          </div>


          <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-[11px] text-blue-700">

            <Clock3
              size={15}
            />

            AI protection is actively monitoring your account.

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;