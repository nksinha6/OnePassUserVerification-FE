// src/services/aadhaarService.js
import apiClient from "@/services/apiClient";
import { API_ENDPOINTS } from "@/constants/config";

/**
 * Fetch Aadhaar data using verification and reference IDs
 * @param {string} verificationId - Verification ID
 * @param {string} referenceId - Reference ID
 * @param {string} phoneCode - Phone country code
 * @param {string} phoneNumber - Phone number
 * @returns {Promise} Aadhaar data or null if not found
 */
export const getAadhaarData = async (
  verificationId,
  referenceId,
  phoneCode,
  phoneNumber,
) => {
  try {
    // Build minimal payload - verificationId is the key identifier
    const payload = {
      verificationId,
      phoneCountryCode: phoneCode,
      phoneNumber,
    };

    // Only include referenceId if it's explicitly provided and not the same as verificationId
    if (referenceId && referenceId !== verificationId) {
      payload.referenceId = referenceId;
    }

    console.log("🔍 Fetching Aadhaar data with payload:", payload);
    console.log("📤 Sending to endpoint:", API_ENDPOINTS.AADHAAR_DATA);

    const response = await apiClient.post(API_ENDPOINTS.AADHAAR_DATA, payload);

    console.log("✅ Aadhaar data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Aadhaar data:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      payload: error.config?.data,
    });

    if (error.response?.status === 404) {
      console.log("⚠️ Aadhaar data not found (404)");
      return null;
    }
    if (error.response?.status === 400) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unknown error";
      throw new Error(`[400] Invalid parameters: ${msg}`);
    }
    if (error.response?.status === 401) {
      throw new Error("Authentication failed (401)");
    }
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
  threshold = 0.75,
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

/**
 * Persist guest selfie using phone details
 * POST: /api/guest/persist/selfie
 *
 * @param {string} phoneCountryCode
 * @param {string} phoneNumber
 * @param {File} imageFile
 * @returns {Promise}
 */
export const persistGuestImage = async (
  phoneCountryCode,
  phoneNumber,
  imageFile,
) => {
  try {
    const formData = new FormData();
    formData.append("phoneCountryCode", phoneCountryCode);
    formData.append("phoneNumber", phoneNumber);
    formData.append("image", imageFile);

    const response = await apiClient.post(
      API_ENDPOINTS.PERSIST_IMAGE,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error("Invalid selfie or phone data");
    }
    if (error.response?.status === 401) {
      throw new Error("Unauthorized request");
    }
    if (error.response?.status === 413) {
      throw new Error("Selfie image too large");
    }

    console.error("Error persisting selfie:", error);
    throw error;
  }
};

/**
 * Persist Aadhaar verification details for guest
 * POST: /api/guest/persist/aadhaar/verify
 *
 * @param {string} phoneCountryCode
 * @param {string} phoneNumber
 * @param {string} name
 * @param {string} gender
 * @param {string} dateOfBirth
 * @param {string} nationality
 * @param {string} verificationId
 * @param {string} referenceId
 * @returns {Promise}
 */
export const persistAadhaarVerify = async (
  uid,
  phoneCountryCode,
  phoneNumber,
  name,
  gender,
  dateOfBirth,
  nationality,
  verificationId,
  referenceId,
  splitAddress,
) => {
  try {
    const payload = {
      uid,
      phoneCountryCode,
      phoneNumber,
      name,
      gender,
      dateOfBirth,
      nationality,
      verificationId,
      referenceId,
      splitAddress: {
        country: splitAddress?.country ?? null,
        state: splitAddress?.state ?? null,
        dist: splitAddress?.dist ?? null,
        subdist: splitAddress?.subdist ?? null,
        vtc: splitAddress?.vtc ?? null,
        po: splitAddress?.po ?? null,
        street: splitAddress?.street ?? null,
        house: splitAddress?.house ?? null,
        landmark: splitAddress?.landmark ?? null,
        pincode: splitAddress?.pincode ?? null,
      },
    };

    const response = await apiClient.post(
      API_ENDPOINTS.PERSIST_AADHAAR_UPDATE,
      payload,
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error("Invalid Aadhaar verification data");
    }
    if (error.response?.status === 401) {
      throw new Error("Unauthorized request");
    }
    if (error.response?.status === 404) {
      throw new Error("Guest not found");
    }

    console.error("Error persisting Aadhaar verification:", error);
    throw error;
  }
};

/**
 * Persist complete Aadhaar update with full payload
 * POST: /api/guest/persist/aadhaar/update
 *
 * @param {object} aadhaarPayload - Complete Aadhaar payload
 * @returns {Promise}
 */
export const persistAadhaarUpdate = async (aadhaarPayload) => {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.PERSIST_AADHAAR_UPDATE,
      aadhaarPayload,
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new Error("Invalid Aadhaar update data");
    }
    if (error.response?.status === 401) {
      throw new Error("Unauthorized request");
    }
    if (error.response?.status === 404) {
      throw new Error("Guest not found");
    }

    console.error("Error persisting Aadhaar update:", error);
    throw error;
  }
};
