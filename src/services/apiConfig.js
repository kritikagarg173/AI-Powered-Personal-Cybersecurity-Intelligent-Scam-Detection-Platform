import { Capacitor } from "@capacitor/core";

const isNativeApp = Capacitor.isNativePlatform();
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const LIVE_API_URL =
  "https://server-beta-five-84.vercel.app/api";

export const API_BASE_URL = isNativeApp
  ? LIVE_API_URL
  : isLocalhost
  ? "http://localhost:5000/api"
  : LIVE_API_URL;