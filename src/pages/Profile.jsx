import { useState } from "react";
import {
  UserRound,
  ShieldCheck,
  Smartphone,
  Users,
  BrainCircuit,
  LockKeyhole,
  Pencil,
  Check,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from "lucide-react";

function Profile() {
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+91 98765 43210",
    location: "New Delhi, India",
  });

  const [draft, setDraft] = useState(profile);

  const handleEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const handleSave = () => {
    setProfile(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* HEADER */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <UserRound size={19} />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
            Account
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your identity, security and protection preferences.
        </p>
      </section>

      {/* PROFILE HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-7 text-white shadow-xl">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">

          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-3xl font-bold backdrop-blur">
              {profile.name.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold">
                  {profile.name}
                </h2>

                <span className="flex items-center gap-1 rounded-full bg-green-400/15 px-2.5 py-1 text-[9px] font-bold text-green-300">
                  <Check size={11} />
                  Verified
                </span>
              </div>

              <p className="mt-1 text-xs text-blue-200">
                Cyber Shield protected account
              </p>

              <div className="mt-3 flex items-center gap-2 text-[10px] text-blue-200">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                AI Guardian Active
              </div>
            </div>
          </div>

          <button
            onClick={handleEdit}
            className="flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
          >
            <Pencil size={14} />
            Edit Profile
          </button>
        </div>
      </section>

      {/* PROFILE + SECURITY */}
      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">

        {/* PERSONAL INFORMATION */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Personal Information
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Your basic account information
              </p>
            </div>

            <UserRound
              size={18}
              className="text-blue-700"
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {/* NAME */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Full Name
              </label>

              {editing ? (
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <UserRound size={15} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">
                    {profile.name}
                  </span>
                </div>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>

              {editing ? (
                <input
                  value={draft.email}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Mail size={15} className="text-slate-400" />
                  <span className="truncate text-xs font-semibold text-slate-700">
                    {profile.email}
                  </span>
                </div>
              )}
            </div>

            {/* PHONE */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Phone Number
              </label>

              {editing ? (
                <input
                  value={draft.phone}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      phone: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <Phone size={15} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">
                    {profile.phone}
                  </span>
                </div>
              )}
            </div>

            {/* LOCATION */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Location
              </label>

              {editing ? (
                <input
                  value={draft.location}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      location: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                  <MapPin size={15} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">
                    {profile.location}
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* EDIT ACTIONS */}
          {editing && (
            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
              <button
                onClick={handleCancel}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-800"
              >
                <Check size={14} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* PROTECTION STATUS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-sm font-bold text-slate-900">
            Protection Status
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Current account security
          </p>

          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-green-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <ShieldCheck size={24} />
            </div>

            <div>
              <p className="text-sm font-bold text-green-700">
                Excellent
              </p>

              <p className="mt-1 text-[10px] text-green-600">
                Your account is well protected.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <LockKeyhole size={16} className="text-blue-700" />
                <span className="text-xs font-semibold text-slate-600">
                  Account Security
                </span>
              </div>

              <span className="text-[10px] font-bold text-green-600">
                Secure
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <BrainCircuit size={16} className="text-purple-600" />
                <span className="text-xs font-semibold text-slate-600">
                  AI Guardian
                </span>
              </div>

              <span className="text-[10px] font-bold text-green-600">
                Active
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* SECURITY OVERVIEW */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900">
            Security Overview
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Your connected protection network
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Smartphone size={19} />
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              3
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-600">
              Devices Protected
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              All devices secure
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <Users size={19} />
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              4
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-600">
              Trusted Contacts
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Safety network connected
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <ShieldCheck size={19} />
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              98%
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-600">
              Protection Score
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Excellent security level
            </p>
          </div>

        </div>
      </section>

      {/* ACCOUNT SECURITY */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Account Security
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Keep your account protected
            </p>
          </div>

          <LockKeyhole
            size={18}
            className="text-blue-700"
          />
        </div>

        <div className="mt-5 divide-y divide-slate-100">

          <button className="flex w-full items-center justify-between py-4 text-left">
            <div>
              <p className="text-xs font-bold text-slate-700">
                Password & Authentication
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Manage your account credentials
              </p>
            </div>

            <ChevronRight
              size={17}
              className="text-slate-400"
            />
          </button>

          <button className="flex w-full items-center justify-between py-4 text-left">
            <div>
              <p className="text-xs font-bold text-slate-700">
                Login Activity
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Review recent account activity
              </p>
            </div>

            <ChevronRight
              size={17}
              className="text-slate-400"
            />
          </button>

        </div>
      </section>

      {/* FOOTER */}
      <div className="flex items-center justify-center gap-2 pb-4 text-[10px] text-slate-400">
        <ShieldCheck size={12} />
        Your personal information is protected by Cyber Shield.
      </div>

    </div>
  );
}

export default Profile;