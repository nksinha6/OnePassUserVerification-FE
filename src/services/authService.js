const SESSION_KEY = "authSession";

/**
 * Get current session data
 * @returns {Object|null} Session data or null if no valid session exists
 */
export const getSession = () => {
  try {
    const sessionData = sessionStorage.getItem(SESSION_KEY);

    if (!sessionData) {
      return null;
    }

    const parsedData = JSON.parse(sessionData);

    // Validate session structure
    if (!parsedData || !parsedData.phone || !parsedData.timestamp) {
      clearSession();
      return null;
    }

    // Check if session is expired (older than 24 hours)
    const isExpired = Date.now() - parsedData.timestamp > 24 * 60 * 60 * 1000;

    if (isExpired) {
      clearSession();
      return null;
    }

    return parsedData;
  } catch (error) {
    console.error("Error getting session:", error);
    clearSession();
    return null;
  }
};

/**
 * Set new session data
 * @param {string} phoneNumber - User's phone number
 * @returns {Object} Result object with success status and optional error
 */
export const setSession = (phoneNumber) => {
  // Basic validation
  if (!phoneNumber || phoneNumber.trim().length < 10) {
    return { success: false, error: "Please enter a valid phone number" };
  }

  try {
    const sessionData = {
      phone: phoneNumber.trim(),
      timestamp: Date.now(),
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return { success: true };
  } catch (error) {
    console.error("Error setting session:", error);

    if (error.name === "QuotaExceededError") {
      return {
        success: false,
        error: "Browser storage is full. Please clear some data.",
      };
    }

    return {
      success: false,
      error: "Failed to save session. Please try again.",
    };
  }
};

/**
 * Clear current session
 * @returns {Object} Result object with success status and optional error
 */
export const clearSession = () => {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    return { success: true };
  } catch (error) {
    console.error("Error clearing session:", error);
    return {
      success: false,
      error: "Failed to clear session. Please try again.",
    };
  }
};
