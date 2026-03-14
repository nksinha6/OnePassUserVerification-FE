import api from "./api";
import ENDPOINTS from "../constants/config";

// Fetch guest by phone number
export const getGuestByPhone = async (phoneCountryCode, phoneNumber) => {
  try {
    const response = await api.get(ENDPOINTS.HOTEL_GUEST_BY_PHONE, {
      params: {
        phoneCountryCode,
        phoneno: phoneNumber,
      },
    });

    return response.data; // because api.get returns full axios response
  } catch (error) {
    if (error.response?.status === 404) {
      console.log("Guest not found, likely a new user");
      return null;
    }

    console.error("Error fetching guest:", error);
    return null;
  }
};

/**
 * Update guest email
 */
export const updateGuestEmail = async (
  phoneCountryCode,
  phoneNumber,
  emailAddress,
) => {
  try {
    const response = await api.put(ENDPOINTS.UPDATE_EMAIL, {
      phoneCountryCode,
      phoneNumber,
      emailAddress,
    });

    return response.data; // ✅ always return data
  } catch (error) {
    console.error(
      "❌ Failed to update email:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Failed to update email");
  }
};

/**
 * Persist Guest Register
 * PUT: /api/guest/persist/status
 *
 * @param {string} phoneCountryCode
 * @param {string} phoneNumber
 * @param {string} verificationStatus
 * @returns {Promise<Object>}
 */
export const persistGuestRegister = async (
  phoneCountryCode,
  phoneNumber,
  verificationStatus,
) => {
  try {
    if (!phoneCountryCode || !phoneNumber) {
      throw new Error("Phone details are required");
    }

    const payload = {
      phoneCountryCode,
      phoneNumber,
      verificationStatus,
    };

    console.log("📤 Persist Guest Register Payload:", payload);
    console.log("📡 Endpoint:", ENDPOINTS.PERSIST_GUEST_REGISTER);

    const response = await api.put(ENDPOINTS.PERSIST_GUEST_REGISTER, payload);

    console.log("✅ Guest Register Persisted:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error persisting guest register:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
/**
 * Update guest profile
 * @param {string} id
 * @param {string} name
 * @param {string} organization
 * @returns {Promise<Object|null>}
 */
export const updateGuestProfile = async (id, name, organization) => {
  try {
    const response = await api.put(ENDPOINTS.UPDATE_GUEST_PROFILE, {
      id,
      name,
      organization,
    });

    return response?.data || null;
  } catch (error) {
    console.error("Update Guest Profile Error:", error.message);
    return null;
  }
};
export default {
  getGuestByPhone,
  updateGuestEmail,
  persistGuestRegister,
  updateGuestProfile,
};
