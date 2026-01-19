// src/services/guestService.js
import apiClient from "@/services/apiClient";
import { API_ENDPOINTS } from "@/constants/config";

/**
 * Fetch guest information by phone number
 * @param {string} phoneCountryCode - Country code (e.g., "+91")
 * @param {string} phoneNumber - Phone number without country code
 * @returns {Promise} Guest data or null if not found
 */
export const getGuestByPhone = async (phoneCountryCode, phoneNumber) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.HOTEL_GUEST_BY_PHONE, {
      params: {
        phoneCountryCode,
        phoneno: phoneNumber,
      },
    });
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 404) {
      // Guest not found - this is expected for new users
      console.log("Guest not found, likely a new user");
      return null;
    }

    // Log other errors but don't break the flow
    console.error("Error fetching guest:", error);
    return null;
  }
};

/**
 * Extract country code and phone number from full phone string
 * @param {string} fullPhone - Full phone number with country code (e.g., "+919876543210")
 * @returns {Object} {countryCode, phoneNumber}
 */
export const parsePhoneNumber = (fullPhone) => {
  // Remove any non-digit characters except leading +
  const cleaned = fullPhone.replace(/\s+/g, "");

  // Extract country code - more specific patterns for common country codes
  // For India: +91 followed by a number (usually starting with 7,8,9)
  if (cleaned.startsWith("+91") && cleaned.length > 3) {
    return {
      countryCode: "+91",
      phoneNumber: cleaned.slice(3).replace(/\D/g, ""),
    };
  }

  // For US/Canada: +1
  if (cleaned.startsWith("+1") && cleaned.length > 2) {
    return {
      countryCode: "+1",
      phoneNumber: cleaned.slice(2).replace(/\D/g, ""),
    };
  }

  // Extract country code (assumes it starts with + and has 1-3 digits)
  const countryCodeMatch = cleaned.match(/^\+\d{1,3}/);
  if (!countryCodeMatch) {
    return {
      countryCode: "+91", // Default to India
      phoneNumber: cleaned.replace(/\D/g, ""),
    };
  }

  const countryCode = countryCodeMatch[0];
  const phoneNumber = cleaned.slice(countryCode.length).replace(/\D/g, "");

  return { countryCode, phoneNumber };
};

/**
 * Fetch guest selfie by phone number
 * @param {string} phoneCountryCode - Country code (e.g., "91")
 * @param {string} phoneNumber - Phone number without country code
 * @returns {Promise} Selfie data or null if not found
 */
export const getGuestSelfieByPhone = async (phoneCountryCode, phoneNumber) => {
  try {
    const response = await apiClient.get(
      API_ENDPOINTS.HOTEL_GUEST_SELFIE_BY_PHONE,
      {
        params: {
          phoneCountryCode,
          phoneno: phoneNumber,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log("Guest selfie not found");
      return null;
    }

    console.error("Error fetching guest selfie:", error);
    return null;
  }
};
