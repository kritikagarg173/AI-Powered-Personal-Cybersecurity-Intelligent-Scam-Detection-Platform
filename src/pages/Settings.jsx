import { useState } from "react";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Bell,
  Link2,
  PhoneCall,
  BrainCircuit,
  LockKeyhole,
  Smartphone,
  ChevronRight,
  Check,
} from "lucide-react";

function Settings() {
  const [settings, setSettings] = useState({
    aiGuardian: true,
    scamDetection: true,
    linkBlocking: true,
    callMonitoring: true,
    securityAlerts: true,
    threatNotifications: true,
    activityMonitoring: true,
    deviceProtection: true,
  });

  const toggleSetting = (key) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const protectionSettings = [
    {
      key: "aiGuardian",
      title: "AI Guardian",
      description: "Continuously detect suspicious digital activity.",
      icon: BrainCircuit,
    },
    {
      key: "scamDetection",
      title: "Scam Detection",
      description: "Identify potential scams and fraudulent activity.",
      icon: ShieldCheck,
    },
    {
      key: "linkBlocking",
      title: "Unsafe Link Blocking",
      description: "Block potentially dangerous links before opening.",
      icon: Link2,
    },
    {
      key: "callMonitoring",
      title: "Call Monitoring",
      description: "Analyze calls for suspicious behavior and scam patterns.",
      icon: PhoneCall,
    },
  ];

  const notificationSettings = [
    {
      key: "securityAlerts",
      title: "Security Alerts",
      description: "Receive important alerts about your account protection.",
    },
    {
      key: "threatNotifications",
      title: "Threat Notifications",
      description: "Get notified when a potential threat is detected.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* HEADER */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <SettingsIcon size={19} />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
            Control Center
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Control how Cyber Shield protects and notifies you.
        </p>
      </section>

      {/* SECURITY STATUS */}
      <section className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck size={25} />
            </div>

            <div>
              <p className="text-sm font-bold">
                Protection System
              </p>

              <p className="mt-1 text-[10px] text-blue-200">
                Your active security controls are managed here.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-green-400/10 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-green-400" />

            <span className="text-[10px] font-bold text-green-300">
              Protection active
            </span>
          </div>

        </div>
      </section>

      {/* PROTECTION CONTROLS */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ShieldCheck size={19} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Protection Controls
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Choose which security layers are active.
            </p>
          </div>
        </div>

        <div className="mt-5 divide-y divide-slate-100">

          {protectionSettings.map((item) => {
            const Icon = item.icon;
            const enabled = settings[item.key];

            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      enabled
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">
                      {item.title}
                    </p>

                    <p className="mt-1 max-w-xl text-[10px] leading-4 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleSetting(item.key)}
                  aria-label={`Toggle ${item.title}`}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    enabled
                      ? "bg-blue-700"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      enabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}

        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <Bell size={19} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Notification Preferences
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Decide which security events should notify you.
            </p>
          </div>
        </div>

        <div className="mt-5 divide-y divide-slate-100">

          {notificationSettings.map((item) => {
            const enabled = settings[item.key];

            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {item.title}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => toggleSetting(item.key)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    enabled
                      ? "bg-blue-700"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      enabled
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}

        </div>
      </section>

      {/* PRIVACY & DEVICE */}
      <section className="grid gap-5 md:grid-cols-2">

        {/* PRIVACY */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <LockKeyhole size={19} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Privacy
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Manage your privacy controls.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold text-slate-700">
                  Activity Monitoring
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Allow Cyber Shield to analyze security activity.
                </p>
              </div>

              <button
                onClick={() => toggleSetting("activityMonitoring")}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  settings.activityMonitoring
                    ? "bg-blue-700"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    settings.activityMonitoring
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>

            </div>
          </div>

          <button className="mt-3 flex w-full items-center justify-between rounded-xl px-2 py-3 text-left hover:bg-slate-50">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Privacy Policy
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Review how your data is protected.
              </p>
            </div>

            <ChevronRight
              size={16}
              className="text-slate-400"
            />
          </button>

        </div>

        {/* DEVICE */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <Smartphone size={19} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Device Protection
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Manage protection for your devices.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                <Check size={18} />
              </div>

              <div>
                <p className="text-xs font-bold text-green-700">
                  Device Protected
                </p>

                <p className="mt-1 text-[10px] text-green-600">
                  Your primary device is currently secure.
                </p>
              </div>
            </div>
          </div>

          <button className="mt-3 flex w-full items-center justify-between rounded-xl px-2 py-3 text-left hover:bg-slate-50">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Manage Devices
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                View and manage connected devices.
              </p>
            </div>

            <ChevronRight
              size={16}
              className="text-slate-400"
            />
          </button>

        </div>
      </section>

      {/* STATUS FOOTER */}
      <div className="flex items-center justify-center gap-2 pb-4 text-[10px] text-slate-400">
        <ShieldCheck size={12} />
        Changes are applied instantly to your protection settings.
      </div>

    </div>
  );
}

export default Settings;