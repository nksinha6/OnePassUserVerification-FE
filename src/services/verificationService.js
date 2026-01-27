// Service to manage verification data storage and retrieval
// Store Aadhaar data associated with phone numbers

const VERIFICATION_STORAGE_PREFIX = "verification_";

/**
 * Store verified Aadhaar data for a phone number
 * @param {string} phoneNumber - Phone number (without country code)
 * @param {object} aadhaarData - Complete Aadhaar data payload
 */
export const storeVerificationData = (phoneNumber, aadhaarData) => {
  try {
    const key = `${VERIFICATION_STORAGE_PREFIX}${phoneNumber}`;
    const dataToStore = {
      ...aadhaarData,
      verifiedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(dataToStore));
    sessionStorage.setItem(key, JSON.stringify(dataToStore));
    console.log(`✅ Verification data stored for ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error("Error storing verification data:", error);
    return false;
  }
};

/**
 * Retrieve verified Aadhaar data for a phone number
 * @param {string} phoneNumber - Phone number (without country code)
 * @returns {object|null} - Aadhaar data or null if not found
 */
export const getVerificationData = (phoneNumber) => {
  try {
    const key = `${VERIFICATION_STORAGE_PREFIX}${phoneNumber}`;
    
    // Try session storage first (more recent)
    let data = sessionStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    
    // Fall back to local storage
    data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    
    return null;
  } catch (error) {
    console.error("Error retrieving verification data:", error);
    return null;
  }
};

/**
 * Check if phone number has verified Aadhaar data
 * @param {string} phoneNumber - Phone number (without country code)
 * @returns {boolean} - True if verified data exists
 */
export const hasVerificationData = (phoneNumber) => {
  const data = getVerificationData(phoneNumber);
  return data !== null;
};

/**
 * Clear verification data for a phone number
 * @param {string} phoneNumber - Phone number (without country code)
 */
export const clearVerificationData = (phoneNumber) => {
  try {
    const key = `${VERIFICATION_STORAGE_PREFIX}${phoneNumber}`;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    console.log(`✅ Verification data cleared for ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error("Error clearing verification data:", error);
    return false;
  }
};
