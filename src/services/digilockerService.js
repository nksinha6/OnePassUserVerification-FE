// src/services/digilockerService.js
import apiClient from "@/services/apiClient";
import { API_ENDPOINTS } from "@/constants/config";

/**
 * Verify DigiLocker account using verification ID and mobile number
 */
export const verifyDigilockerAccount = async (verificationId, mobileNumber) => {
  try {
    console.log("🔍 Verifying DigiLocker account...");

    const response = await apiClient.post(
      API_ENDPOINTS.DIGILOCKER_VERIFY_ACCOUNT,
      {
        verification_id: verificationId,
        mobile_number: mobileNumber,
      }
    );

    console.log("✅ DigiLocker verification successful");
    return response.data;
  } catch (error) {
    console.error("❌ DigiLocker verification error:", error.response?.data || error.message);

    if (error.response?.status === 400) {
      throw new Error("Invalid verification details provided");
    }
    if (error.response?.status === 404) {
      throw new Error("DigiLocker account not found");
    }
    if (error.response?.status === 422) {
      throw new Error("Invalid mobile number format");
    }

    throw new Error(error.response?.data?.message || "DigiLocker verification failed");
  }
};

/**
 * Create DigiLocker URL for document sharing
 * @param {string} verificationId - Unique verification ID
 * @param {string[]} documentRequested - Array of requested documents (e.g., ["AADHAAR"])
 * @param {string} redirectUrl - URL to redirect after DigiLocker flow
 * @param {string} userFlow - User flow type (e.g., "signin", "signup", "verify")
 * @returns {Promise} Response containing DigiLocker URL
 */
export const createDigilockerUrl = async (
  verificationId,
  documentRequested = ["AADHAAR"],
  // redirectUrl = "https://seashell-app-dmof6.ondigitalocean.app/selfie",
  redirectUrl,
  userFlow
) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.DIGILOCKER_CREATE_URL, {
      verification_id: verificationId,
      document_requested: documentRequested,
      redirect_url: redirectUrl,
      user_flow: userFlow,
    });
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 400) {
      throw new Error("Invalid request parameters");
    }

    if (error.response?.status === 422) {
      const errorMessage =
        error.response.data?.message || "Invalid document type or parameters";
      throw new Error(errorMessage);
    }

    if (error.response?.status === 500) {
      throw new Error("DigiLocker service is temporarily unavailable");
    }

    // Log and rethrow for other errors
    console.error("DigiLocker create URL error:", error);
    throw new Error("Failed to create DigiLocker URL. Please try again.");
  }
};