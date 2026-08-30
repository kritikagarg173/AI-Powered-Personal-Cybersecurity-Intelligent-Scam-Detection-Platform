import { Capacitor } from "@capacitor/core";

const isAndroidApp = Capacitor.isNativePlatform();

export const API_BASE_URL = isAndroidApp
  ? "http://10.0.2.2:5000/api"
  : "http://localhost:5000/api";