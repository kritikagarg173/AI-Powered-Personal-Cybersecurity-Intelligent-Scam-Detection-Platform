import {
  LayoutDashboard,
  Bot,
  Link2,
  PhoneCall,
  ScanSearch,
  ShieldCheck,
  Users,
  Bell,
  UserRoundCheck,
  HeartPulse,
  UserRound,
  Settings,
  LifeBuoy,
  Shield,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../services/apiConfig";

const menuItems = [
  {
    section: "MAIN",
    items: [
      { name: "Dashboard", icon: LayoutDashboard },
      { name: "AI Assistant", icon: Bot },
      { name: "Link Scanner", icon: Link2 },
    ],
  },
  {
    section: "PROTECTION",
    items: [
      { name: "Live Call Monitoring", icon: PhoneCall },
      { name: "Screenshot Analyzer", icon: ScanSearch },
      { name: "Caller Verification", icon: UserRoundCheck },
      { name: "Trusted Contacts", icon: Users },
    ],
  },
  {
    section: "SAFETY",
    items: [
      { name: "Elderly Mode", icon: ShieldCheck },
      { name: "Security Dashboard", icon: Shield },
      { name: "Safety Meter", icon: HeartPulse },
      { name: "Notifications", icon: Bell },
    ],
  },
  {
    section: "ACCOUNT",
    items: [
      { name: "Profile", icon: UserRound },
      { name: "Settings", icon: Settings },
      { name: "Support", icon: LifeBuoy },
    ],
  },
];

function Sidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUnreadCount(0);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return;
      }

      const notifications = data.notifications || [];

      const count = notifications.filter(
        (notification) => notification.unread
      ).length;

      setUnreadCount(count);
    } catch (error) {
      console.error("Sidebar notification count error:", error);
    }
  };

  useEffect(() => {
  fetchUnreadCount();

  const interval = setInterval(() => {
    fetchUnreadCount();
  }, 2000);

  const handleNotificationUpdate = () => {
    fetchUnreadCount();
  };

  window.addEventListener(
    "notificationsUpdated",
    handleNotificationUpdate
  );

  return () => {
    clearInterval(interval);

    window.removeEventListener(
      "notificationsUpdated",
      handleNotificationUpdate
    );
  };
}, []);
  const handleNavigation = (itemName) => {
  if (itemName === "Dashboard") {
    navigate("/");
  }

  if (itemName === "AI Assistant") {
    navigate("/ai-assistant");
  }

  if (itemName === "Link Scanner") {
    navigate("/link-scanner");
  }

  if (itemName === "Screenshot Analyzer") {
    navigate("/screenshot-analyzer");
  }

  if (itemName === "Live Call Monitoring") {
    navigate("/live-call-monitoring");
  }
  if (itemName === "Caller Verification") {
  navigate("/caller-verification");
}
if (itemName === "Trusted Contacts") {
  navigate("/trusted-contacts");
}
if (itemName === "Elderly Mode") {
  navigate("/elderly-mode");
}
if (itemName === "Security Dashboard") {
  navigate("/security-dashboard");
}
if (itemName === "Safety Meter") {
  navigate("/safety-meter");
}
if (itemName === "Notifications") {
  navigate("/notifications");
}
if (itemName === "Profile") {
  navigate("/profile");
}
if (itemName === "Settings") {
  navigate("/settings");
}
if (itemName === "Support") {
  navigate("/support");
}
if (itemName === "AI Assistant") {
  navigate("/ai-assistant");
}
};
  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-lg shadow-blue-700/20">
              <Shield size={22} strokeWidth={2.5} />
            </div>

            <div>
              <h1 className="text-[17px] font-bold tracking-tight text-slate-900">
                Cyber Shield
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-600">
                AI Protection
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          {menuItems.map((group) => (
            <div key={group.section} className="mb-6">
              {/* Section Title */}
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">
                {group.section}
              </p>

              <div className="space-y-1">
                {group.items.map((item, index) => {
                  const Icon = item.icon;

                  const active =
                    group.section === "MAIN" && index === 0;

                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.name)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.4 : 1.9}
                      />

                      <span>{item.name}</span>

                      {/* Notification Badge */}
{item.name === "Notifications" && unreadCount > 0 && (
  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
    {unreadCount}
  </span>
)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* AI Guardian Card */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 p-4 text-white">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck size={19} />
            </div>

            <p className="text-sm font-semibold">
              AI Guardian Active
            </p>

            <p className="mt-1 text-[11px] leading-4 text-blue-100">
              Your digital activity is being protected.
            </p>

            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold">
              <span className="h-2 w-2 rounded-full bg-green-400" />

              Protection enabled
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;