// import { STORAGE_KEYS } from "@/constants/config";
// import { ERROR_MESSAGES } from "@/constants/ui";

// /**
//  * Get current session data
//  * @returns {Object|null} Session data or null if no valid session exists
//  */
// export const getSession = () => {
//   try {
//     const sessionData = sessionStorage.getItem(STORAGE_KEYS.SESSION);

//     if (!sessionData) {
//       return null;
//     }

//     const parsedData = JSON.parse(sessionData);

//     // Validate session structure
//     if (!parsedData || !parsedData.phone || !parsedData.timestamp) {
//       clearSession();
//       return null;
//     }

//     // Check if session is expired (older than 24 hours)
//     const isExpired = Date.now() - parsedData.timestamp > 24 * 60 * 60 * 1000;

//     if (isExpired) {
//       clearSession();
//       return null;
//     }

//     return parsedData;
//   } catch (error) {
//     console.error(ERROR_MESSAGES.CLEAR_SESSION_FAILED, error);
//     clearSession();
//     return null;
//   }
// };

// /**
//  * Set new session data
//  * @param {string} phoneNumber - User's phone number
//  * @returns {Object} Result object with success status and optional error
//  */
// export const setSession = (phoneNumber) => {
//   const phoneStr =
//     phoneNumber && typeof phoneNumber === "object"
//       ? phoneNumber.phone || ""
//       : String(phoneNumber || "");

//   // Basic validation
//   if (!phoneStr || phoneStr.trim().length < 10) {
//     return { success: false, error: ERROR_MESSAGES.INVALID_PHONE };
//   }

//   try {
//     const sessionData = {
//       phone: phoneStr.trim(),
//       timestamp: Date.now(),
//     };

//     sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
//     return { success: true };
//   } catch (error) {
//     console.error("Error setting session:", error);

//     if (error.name === "QuotaExceededError") {
//       return {
//         success: false,
//         error: ERROR_MESSAGES.STORAGE_FULL,
//       };
//     }

//     return {
//       success: false,
//       error: ERROR_MESSAGES.SAVE_SESSION_FAILED,
//     };
//   }
// };

// /**
//  * Clear current session
//  * @returns {Object} Result object with success status and optional error
//  */
// export const clearSession = () => {
//   try {
//     sessionStorage.removeItem(STORAGE_KEYS.SESSION);
//     return { success: true };
//   } catch (error) {
//     console.error(ERROR_MESSAGES.CLEAR_SESSION_FAILED, error);
//     return {
//       success: false,
//       error: ERROR_MESSAGES.CLEAR_SESSION_FAILED,
//     };
//   }
// };

// -- API Service Implimentation --

import { STORAGE_KEYS } from "@/constants/config";
import { ERROR_MESSAGES } from "@/constants/ui";
import apiClient from "@/services/apiClient";
import { API_ENDPOINTS } from "@/constants/config";

/**
 * Get current session data
 * @returns {Object|null} Session data or null if no valid session exists
 */
export const getSession = () => {
  try {
    const sessionData = sessionStorage.getItem(STORAGE_KEYS.SESSION);

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
    console.error(ERROR_MESSAGES.CLEAR_SESSION_FAILED, error);
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
  const phoneStr =
    phoneNumber && typeof phoneNumber === "object"
      ? phoneNumber.phone || ""
      : String(phoneNumber || "");

  // Basic validation
  if (!phoneStr || phoneStr.trim().length < 10) {
    return { success: false, error: ERROR_MESSAGES.INVALID_PHONE };
  }

  try {
    const sessionData = {
      phone: phoneStr.trim(),
      timestamp: Date.now(),
    };

    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));

    return { success: true };
  } catch (error) {
    console.error("Error setting session:", error);

    if (error.name === "QuotaExceededError") {
      return {
        success: false,
        error: ERROR_MESSAGES.STORAGE_FULL,
      };
    }

    return {
      success: false,
      error: ERROR_MESSAGES.SAVE_SESSION_FAILED,
    };
  }
};

/**
 * Clear current session
 * @returns {Object} Result object with success status and optional error
 */
export const clearSession = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    return { success: true };
  } catch (error) {
    console.error(ERROR_MESSAGES.CLEAR_SESSION_FAILED, error);
    return {
      success: false,
      error: ERROR_MESSAGES.CLEAR_SESSION_FAILED,
    };
  }
};

/**
 * ------------------------------------
 * LOGIN SERVICE – SEND OTP
 * ------------------------------------
 */

/**
 * Login service (Send OTP)
 * @param {string} phoneCountryCode
 * @param {string} phoneNumber
 * @returns {Promise<Object>}
 */
export const loginService = async (phoneCountryCode, phoneNumber) => {
  // Basic validation
  if (!phoneNumber || phoneNumber.trim().length < 10) {
    throw new Error(ERROR_MESSAGES.INVALID_PHONE);
  }

  try {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
      phoneCountryCode,
      phoneNumber,
    });

    // ✅ Save session after OTP is successfully sent
    setSession(phoneNumber);

    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE);
    }

    if (error.response?.status === 401) {
      throw new Error(ERROR_MESSAGES.AUTH_FAILED);
    }

    console.error("Login service error:", error);
    throw error;
  }
};

/**
 * ------------------------------------
 * VERIFY OTP SERVICE (NEW)
 * ------------------------------------
 */

/**
 * Verify OTP for login
 * @param {string} phoneCountryCode
 * @param {string} phoneNumber
 * @param {string} otp
 * @returns {Promise<Object>}
 */
export const verifyOtpService = async (phoneCountryCode, phoneNumber, otp) => {
  if (!otp || otp.length < 4) {
    throw new Error("Invalid OTP");
  }

  try {
    const response = await apiClient.post(API_ENDPOINTS.VERIFY_OTP, {
      phoneCountryCode,
      phoneNumber,
      otp,
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error("Invalid OTP");
    }
    if (error.response?.status === 401) {
      throw new Error("OTP verification failed");
    }

    console.error("Verify OTP service error:", error);
    throw error;
  }
};
