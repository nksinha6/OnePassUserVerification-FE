// src/services/apiClient.js
import axios from "axios";
import {
  API_BASE_URL,
  API_CONFIG,
  TENANT_ID,
  STORAGE_KEYS,
} from "@/constants/config.js";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "X-Tenant-ID": TENANT_ID,
  },
});

// Request interceptor to log and validate requests
apiClient.interceptors.request.use(
  (config) => {
    // Log request details
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);

    // Validate JSON if data exists
    if (config.data && typeof config.data === 'object') {
      try {
        // Check for duplicate keys by stringifying and parsing
        const jsonStr = JSON.stringify(config.data);
        JSON.parse(jsonStr); // This will throw if invalid JSON
        console.log("📤 Request Data (valid JSON):", config.data);
      } catch (jsonError) {
        console.error("❌ Invalid JSON in request:", jsonError);
        // Clean the data by creating a new object
        config.data = Object.fromEntries(
          Object.entries(config.data).filter(([key]) => key && key.trim())
        );
        console.log("📤 Request Data (cleaned):", config.data);
      }
    }

    return config;
  },
  (error) => {
    console.error("📤 Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error ${error.response?.status || "Network"}:`, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      console.error("Unauthorized - Clearing session");
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    }

    return Promise.reject(error);
  }
);

export default apiClient;