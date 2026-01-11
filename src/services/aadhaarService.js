// src/services/aadhaarService.js
import apiClient from "@/services/apiClient";
import { API_ENDPOINTS } from "@/constants/config";

/**
 * Fetch Aadhaar data using verification and reference IDs
 * @param {string} verificationId - Verification ID
 * @param {string} referenceId - Reference ID
 * @returns {Promise} Aadhaar data or null if not found
 */
export const getAadhaarData = async (verificationId, referenceId) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.AADHAAR_DATA, {
      params: {
        verificationId,
        referenceId,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log("Aadhaar data not found");
      return null;
    }
    if (error.response?.status === 400) {
      throw new Error("Invalid verification or reference ID");
    }
    if (error.response?.status === 401) {
      throw new Error("Authentication failed");
    }
    console.error("Error fetching Aadhaar data:", error);
    throw error;
  }
};

/**
 * Face match verification service
 * @param {string} verificationId - Verification ID
 * @param {File} selfieFile - Selfie image file
 * @param {File} idImageFile - Aadhaar image file
 * @param {number} threshold - Match threshold (default: 0.75)
 * @returns {Promise} Face match result
 */
export const matchFace = async (
  verificationId,
  selfieFile,
  idImageFile,
  threshold = 0.75
) => {
  try {
    const formData = new FormData();
    formData.append("verificationId", verificationId);
    formData.append("selfie", selfieFile);
    formData.append("idImage", idImageFile);
    formData.append("threshold", threshold);

    const response = await apiClient.post(API_ENDPOINTS.FACE_MATCH, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error("Invalid image files or parameters");
    }
    if (error.response?.status === 413) {
      throw new Error("Image file size exceeds limit");
    }
    if (error.response?.status === 422) {
      throw new Error("Face not detected in image(s)");
    }
    console.error("Error in face match verification:", error);
    throw error;
  }
};
