import { useEffect, useState } from "react";

import {
  Bell,
  ShieldAlert,
  Link2,
  PhoneCall,
  ShieldCheck,
  BrainCircuit,
  CheckCircle2,
  Check,
  Trash2,
  Filter,
} from "lucide-react";
import { API_BASE_URL } from "../services/apiConfig";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  // ======================================================
  // FETCH NOTIFICATIONS
  // ======================================================


const fetchNotifications = async () => {
  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    // No login token: show the empty state without an error.
    if (!token) {
      setNotifications([]);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load notifications");
    }

    const formatted = (data.notifications || []).map((item) => ({
      id: item._id,
      type: item.type,
      title: item.title,
      message: item.message,
      unread: item.unread,
      source: item.source,
      createdAt: item.createdAt,
    }));

    setNotifications(formatted);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    setError(error.message || "Failed to load notifications");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchNotifications();
  }, []);

  // ======================================================
  // COUNTS + FILTER
  // ======================================================

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter(
          (notification) => notification.type === filter
        );

  // ======================================================
  // MARK ONE AS READ
  // ======================================================

  const markAsRead = async (id) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Login token not found.");
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to mark notification as read"
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                unread: false,
              }
            : notification
        )
      );
      window.dispatchEvent(
      new Event("notificationsUpdated")
    );
    } catch (error) {
      console.error("Mark as read error:", error);
      setError(error.message);
    }
  };

  // ======================================================
  // MARK ALL AS READ
  // ======================================================

  const markAllAsRead = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Login token not found.");
      }

      const response = await fetch(
  `${API_BASE_URL}/notifications/read-all`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to mark all notifications as read"
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          unread: false,
        }))
      );
      window.dispatchEvent(
  new Event("notificationsUpdated")
);
    } catch (error) {
      console.error("Mark all as read error:", error);
      setError(error.message);
    }
  };

  // ======================================================
  // CLEAR ALL
  // ======================================================

  const clearAll = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Login token not found.");
      }

      const response = await fetch(
  `${API_BASE_URL}/notifications`,
  {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to clear notifications"
        );
      }

      setNotifications([]);
      window.dispatchEvent(
  new Event("notificationsUpdated")
);
      
    } catch (error) {
      console.error("Clear notifications error:", error);
      setError(error.message);
    }
  };

  // ======================================================
  // TYPE STYLES
  // ======================================================

  const getTypeStyles = (type) => {
    if (type === "threat") {
      return {
        bg: "bg-red-50",
        icon: "text-red-600",
        label: "Threat Alert",
        labelBg: "bg-red-50 text-red-600",
      };
    }

    if (type === "ai") {
      return {
        bg: "bg-purple-50",
        icon: "text-purple-600",
        label: "AI Guardian",
        labelBg: "bg-purple-50 text-purple-600",
      };
    }

    return {
      bg: "bg-green-50",
      icon: "text-green-600",
      label: "Protection",
      labelBg: "bg-green-50 text-green-600",
    };
  };

  // ======================================================
  // NOTIFICATION ICON
  // ======================================================

  const getNotificationIcon = (source) => {
    if (source === "LINK_SCAN") return Link2;

    if (source === "SCAM_CALL") return PhoneCall;

    if (source === "CALLER_VERIFICATION") {
      return PhoneCall;
    }

    if (source === "SCREENSHOT_ANALYSIS") {
      return ShieldAlert;
    }

    if (source === "GUARDIAN_ALERT") {
      return ShieldCheck;
    }

    if (source === "SOS") {
      return ShieldAlert;
    }

    if (source === "SECURITY_SCAN") {
      return ShieldCheck;
    }

    if (source === "SYSTEM") {
      return BrainCircuit;
    }

    return Bell;
  };

  // ======================================================
  // DATE FORMATTER
  // ======================================================

  const formatNotificationTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">

      {/* HEADER */}
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Bell size={19} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Security Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Notifications
            </h1>

            {unreadCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Stay informed about threats and protection activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={14} />
            Mark all read
          </button>

          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={14} />
            Clear all
          </button>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
          {error}
        </div>
      )}

      {/* SECURITY STATUS */}
      <section className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck size={25} />
            </div>

            <div>
              <p className="text-sm font-bold">
                Protection notifications
              </p>

              <p className="mt-1 text-[10px] text-blue-200">
                Cyber Shield keeps you informed whenever something important
                happens.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-green-400/10 px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-green-400" />

            <span className="text-[10px] font-bold text-green-300">
              Monitoring active
            </span>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="flex flex-wrap items-center gap-2">
        <div className="mr-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Filter size={13} />
          Filter
        </div>

        {[
          { id: "all", label: "All" },
          { id: "threat", label: "Threats" },
          { id: "protection", label: "Protection" },
          { id: "ai", label: "AI Guardian" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-xl px-4 py-2 text-[10px] font-bold transition ${
              filter === item.id
                ? "bg-blue-700 text-white shadow-md shadow-blue-700/20"
                : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </section>

      {/* LOADING */}
      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-xs text-slate-400 shadow-sm">
          Loading notifications...
        </div>
      )}

      {/* NOTIFICATION LIST */}
      {!loading && (
        <section className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <CheckCircle2 size={28} />
              </div>

              <h2 className="mt-4 text-sm font-bold text-slate-800">
                You're all caught up
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-400">
                No notifications match your current filter.
                Your protection system is operating normally.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(
                notification.source
              );

              const styles = getTypeStyles(
                notification.type
              );

              return (
                <div
                  key={notification.id}
                  className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                    notification.unread
                      ? "border-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex gap-4">

                    {/* ICON */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.icon}`}
                    >
                      <Icon size={20} />
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">

                        <div className="flex flex-wrap items-center gap-2">
                          <h2
                            className={`text-sm ${
                              notification.unread
                                ? "font-bold text-slate-900"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {notification.title}
                          </h2>

                          {notification.unread && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          )}
                        </div>

                        <span className="shrink-0 text-[9px] font-medium text-slate-400">
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                        </span>

                      </div>

                      <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-4 flex items-center justify-between gap-3">

                        <span
                          className={`rounded-lg px-2.5 py-1 text-[9px] font-bold ${styles.labelBg}`}
                        >
                          {styles.label}
                        </span>

                        {notification.unread && (
                          <button
                            onClick={() =>
                              markAsRead(notification.id)
                            }
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-blue-700"
                          >
                            <Check size={12} />
                            Mark as read
                          </button>
                        )}

                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-center gap-2 pb-4 text-[10px] text-slate-400">
        <ShieldAlert size={12} />
        Important security alerts will always appear here.
      </div>

    </div>
  );
}

export default Notifications;