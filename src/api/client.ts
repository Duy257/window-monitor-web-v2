import axios from "axios";
import { API_REST_BASE_URL, API_TIMEOUT } from "./config";
import { getApiKey } from "./auth";
import { toAppError } from "./errors";

export const apiClient = axios.create({
  baseURL: API_REST_BASE_URL,
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
    const appError = toAppError(error);

    if (appError.status === 401 || appError.status === 403) {
      localStorage.removeItem("winmonitor_api_key");
      window.dispatchEvent(new Event("auth:required"));
    }

    return Promise.reject(appError);
  }
);
