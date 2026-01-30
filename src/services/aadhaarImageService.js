import apiClient from "@/services/apiClient";
import { API_ENDPOINTS } from "@/constants/config";

/**
 * Fetch Aadhaar image for a guest using phone details
 * @param {string} phoneCountryCode - Phone country code (e.g. "91")
 * @param {string} phoneNumber - Phone number (e.g. "9876543210")
 * @returns {Promise<Object|null>} Aadhaar image data or null if not found
 */
export const getAadhaarImageByPhone = async (phoneCountryCode, phoneNumber) => {
  try {
    const params = {
      phoneCountryCode,
      phoneno: phoneNumber,
    };

    console.log("🔍 Fetching Aadhaar image with params:", params);
    console.log("📤 Endpoint:", API_ENDPOINTS.AADHAAR_IMAGE_BY_PHONE);

    const response = await apiClient.get(API_ENDPOINTS.AADHAAR_IMAGE_BY_PHONE, {
      params,
    });

    console.log("✅ Aadhaar image data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Aadhaar image:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 404) {
      console.log("⚠️ Aadhaar image not found (404)");
      return null;
    }

    if (error.response?.status === 400) {
      throw new Error(
        error.response?.data?.message || "Invalid phone details (400)",
      );
    }

    if (error.response?.status === 401) {
      throw new Error("Authentication failed (401)");
    }

    throw error;
  }
};
