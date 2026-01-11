// src/api/apiClient.js
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

// Simple request interceptor
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Simple response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - Please login again");
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    }
    return Promise.reject(error);
  }
);

// Export only the axios instance
export default apiClient;
