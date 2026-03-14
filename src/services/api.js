import axios from "axios";

const API_BASE = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Debug: log full request URL and params so we can see if requests are hitting the dev server
    try {
      const base = config.baseURL || "";
      const url = `${base}${config.url || ""}`;
      console.log(
        "[api] request:",
        config.method?.toUpperCase(),
        url,
        "params=",
        config.params || {},
        "data=",
        config.data || {},
      );
    } catch (e) {
      // ignore logging errors
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    sessionStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("token");
  }
}

export const get = (url, config) => api.get(url, config).then((r) => r.data);
export const post = (url, data, config) =>
  api.post(url, data, config).then((r) => r.data);
export const put = (url, data, config) =>
  api.put(url, data, config).then((r) => r.data);
export const del = (url, config) => api.delete(url, config).then((r) => r.data);

export default api;
