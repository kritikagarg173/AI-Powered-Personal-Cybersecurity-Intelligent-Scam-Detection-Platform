import { API_BASE_URL } from "./apiConfig";

export const getDashboardOverview = async () => {
  const response = await fetch(
    `${API_BASE_URL}/dashboard/overview`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load dashboard"
    );
  }

  return data;
};

export const runSecurityScan = async () => {
  const response = await fetch(
    `${API_BASE_URL}/dashboard/scan`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Security scan failed"
    );
  }

  return data;
};