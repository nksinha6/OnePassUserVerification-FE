import apiClient from "@/services/apiClient";
import { API_ENDPOINTS } from "@/constants/config";

/**
 * Verify DigiLocker account using verification ID and mobile number
 * @param {string} verificationId - Unique verification ID from DigiLocker
 * @param {string} mobileNumber - User's mobile number
 * @returns {Promise} Verification response data
 */
export const verifyDigilockerAccount = async (verificationId, mobileNumber) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.DIGILOCKER_VERIFY_ACCOUNT,
      {
        verification_id: verificationId,
        mobile_number: mobileNumber,
      }
    );
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 400) {
      throw new Error("Invalid verification details provided");
    }

    if (error.response?.status === 404) {
      throw new Error("DigiLocker account not found");
    }

    if (error.response?.status === 422) {
      throw new Error("Invalid mobile number format");
    }

    // Log and rethrow for other errors
    console.error("DigiLocker verification error:", error);
    throw new Error("DigiLocker verification failed. Please try again.");
  }
};
