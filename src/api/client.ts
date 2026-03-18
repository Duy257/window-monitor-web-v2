import axios from "axios";
import { API_TIMEOUT } from "./config";
import { getApiKey } from "./auth";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3002",
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const key = getApiKey();
  if (key) {
    config.headers["x-api-key"] = key;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("winmonitor_api_key");
      window.dispatchEvent(new Event("auth:required"));
    }
    return Promise.reject(error);
  }
);
