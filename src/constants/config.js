// src/constants/config.js
// API Base URL (using proxy)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Tenant ID
export const TENANT_ID = 1;

// API Endpoints for your 1PassWebApp
export const API_ENDPOINTS = {
  LOGIN: "/guest/persist/sendOtp",
  VERIFY_OTP: "/HotelGuestRead/verify_otp",
  HOTEL_GUEST_BY_PHONE: "/HotelGuestRead/guest_by_id",
  HOTEL_GUEST_SELFIE_BY_PHONE: "/HotelGuestRead/selfie",
  DIGILOCKER_VERIFY_ACCOUNT: "/digilocker/verify-account",
  DIGILOCKER_CREATE_URL: "/digilocker/create-url",
  AADHAAR_DATA: "/digilocker/aadhaar",
  FACE_MATCH: "/faceverification/match",
  PERSIST_SELFIE: "/guest/persist/selfie",
  PERSIST_AADHAAR_UPDATE: "/guest/persist/aadhaar/update",
  UPDATE_EMAIL: "/guest/persist/email/update",
  PROPERTY_BY_ID: "/HotelPropertyRead/property_by_id",
};

// Storage Keys (only what we need)
export const STORAGE_KEYS = {
  SESSION: "authSession", // Match your AuthContext
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
};