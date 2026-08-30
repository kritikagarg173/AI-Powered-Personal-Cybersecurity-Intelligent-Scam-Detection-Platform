// ==========================================
// ELDERLY MODE SAFETY SERVICE
// ==========================================

// Calculate user's protection score
const calculateProtectionScore = (settings) => {
  let score = 40;

  // AI Guardian
  if (settings.aiGuardianEnabled) {
    score += 20;
  }

  // Scam Protection
  if (settings.scamProtection) {
    score += 15;
  }

  // Call Protection
  if (settings.callProtection) {
    score += 15;
  }

  // Fraud Alerts
  if (settings.fraudAlerts) {
    score += 10;
  }

  // Active threats are shown separately.
  // They should NOT reduce the protection configuration score.

  return Math.max(0, Math.min(100, score));
};


// ==========================================
// GET PROTECTION STATUS
// ==========================================

const getProtectionStatus = (score) => {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Good";
  }

  if (score >= 50) {
    return "Moderate";
  }

  return "At Risk";
};


// ==========================================
// BUILD SAFETY OVERVIEW
// ==========================================

const buildSafetyOverview = (settings) => {
  const protectionScore =
    calculateProtectionScore(settings);

  const protectionStatus =
    getProtectionStatus(protectionScore);

  return {
    protectionScore,
    protectionStatus,

    aiGuardian: settings.aiGuardianEnabled,
    scamProtection: settings.scamProtection,
    callProtection: settings.callProtection,
    fraudAlerts: settings.fraudAlerts,

    activeThreats:
      settings.activeThreats || 0,

    isProtected:
      settings.aiGuardianEnabled &&
      protectionScore >= 75,

    lastSafetyCheck:
      settings.lastSafetyCheck || new Date(),
  };
};


module.exports = {
  calculateProtectionScore,
  getProtectionStatus,
  buildSafetyOverview,
};