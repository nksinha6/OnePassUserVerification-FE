// API Base URL (using proxy)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Tenant ID
export const TENANT_ID = 1;

// API Endpoints for your 1PassWebApp
export const API_ENDPOINTS = {
  HOTEL_GUEST_BY_PHONE: "/HotelGuestRead/guest_by_id",
  DIGILOCKER_VERIFY_ACCOUNT: "/digilocker/verify-account",
};

// Storage Keys (only what we need)
export const STORAGE_KEYS = {
  SESSION: "authSession", // Match your AuthContext
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
};
