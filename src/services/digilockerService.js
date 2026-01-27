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
 * Update guest email
 */
export const updateGuestEmail = async (phoneCountryCode, phoneNumber, email) => {
  try {
    console.log("📧 Updating guest email...");

    const response = await apiClient.post(API_ENDPOINTS.UPDATE_EMAIL, {
      phoneCountryCode,
      phoneNumber,
      email,
    });

    console.log("✅ Email updated successfully");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update email:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update email");
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
    console.log("🔗 Creating DigiLocker URL with params:", {
      verification_id: verificationId,
      document_requested: documentRequested,
      redirect_url: redirectUrl,
      user_flow: userFlow,
    });

    // Try standard payload first
    const payload = {
      verification_id: verificationId,
      document_requested: documentRequested,
      redirect_url: redirectUrl,
      user_flow: userFlow,
    };

    console.log("📤 Sending request to:", API_ENDPOINTS.DIGILOCKER_CREATE_URL);
    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    const response = await apiClient.post(API_ENDPOINTS.DIGILOCKER_CREATE_URL, payload);
    
    console.log("✅ DigiLocker URL created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ DigiLocker create URL error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });

    // If first attempt fails, log more details for debugging
    if (error.response) {
      console.error("🔍 Backend Error Details:", error.response.data);
    }

    // Handle specific error cases
    if (error.response?.status === 400) {
      const msg = error.response.data?.message || "Invalid request parameters";
      throw new Error(`[400] ${msg}`);
    }

    if (error.response?.status === 404) {
      throw new Error(`[404] DigiLocker endpoint not found. Check API URL: ${API_ENDPOINTS.DIGILOCKER_CREATE_URL}`);
    }

    if (error.response?.status === 422) {
      const errorMessage =
        error.response.data?.message || "Invalid document type or parameters";
      throw new Error(`[422] ${errorMessage}`);
    }

    if (error.response?.status === 500) {
      throw new Error("DigiLocker service is temporarily unavailable");
    }

    // Log and rethrow for other errors
    throw new Error(error.response?.data?.message || "Failed to create DigiLocker URL. Please try again.");
  }
};