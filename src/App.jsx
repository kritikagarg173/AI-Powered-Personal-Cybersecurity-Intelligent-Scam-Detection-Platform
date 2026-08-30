import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ElderlyMode from "./pages/ElderlyMode";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import TrustedContacts from "./pages/TrustedContacts";
import Dashboard from "./pages/Dashboard";
import LinkScanner from "./pages/LinkScanner";
import ScreenshotAnalyzer from "./pages/ScreenshotAnalyzer";
import LiveCallMonitoring from "./pages/LiveCallMonitoring";
import CallerVerification from "./pages/CallerVerification";
import SecurityDashboard from "./pages/SecurityDashboard";
import SafetyMeter from "./pages/SafetyMeter";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import AIAssistant from "./pages/AIAssistant";

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f5f8fc]">
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div className="lg:pl-[270px]">
          <Topbar setMobileOpen={setMobileOpen} />

          <main className="min-h-[calc(100vh-76px)] p-5 md:p-7 lg:p-8">
            <Routes>

              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Main Features */}
              <Route
                path="/link-scanner"
                element={<LinkScanner />}
              />

              {/* Protection */}
              <Route
                path="/screenshot-analyzer"
                element={<ScreenshotAnalyzer />}
              />

              <Route
                path="/live-call-monitoring"
                element={<LiveCallMonitoring />}
              />

              <Route
                path="/caller-verification"
                element={<CallerVerification />}
              />
              <Route
  path="/trusted-contacts"
  element={<TrustedContacts />}
/>
<Route
  path="/elderly-mode"
  element={<ElderlyMode />}
/>
<Route
  path="/security-dashboard"
  element={<SecurityDashboard />}
/>
<Route
  path="/safety-meter"
  element={<SafetyMeter />}
/>
<Route
  path="/notifications"
  element={<Notifications />}
/>
<Route
  path="/profile"
  element={<Profile />}
/>
<Route
  path="/settings"
  element={<Settings />}
/>
<Route
  path="/support"
  element={<Support />}
/>
<Route
  path="/ai-assistant"
  element={<AIAssistant />}
/>

            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;