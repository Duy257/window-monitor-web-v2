/**
 * API Configuration - Base URL, API Key, Timeouts, and Socket settings
 */

function envInt(value: string | undefined, fallback: number): number {
  const n = parseInt(value ?? "", 10);
  return isNaN(n) ? fallback : n;
}

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";
export const API_KEY = import.meta.env.VITE_API_KEY || "";
export const API_TIMEOUT = envInt(import.meta.env.VITE_API_TIMEOUT, 30000);

export const SOCKET_RECONNECT_ATTEMPTS = envInt(
  import.meta.env.VITE_SOCKET_RECONNECT_ATTEMPTS,
  5
);
export const SOCKET_RECONNECT_DELAY = envInt(
  import.meta.env.VITE_SOCKET_RECONNECT_DELAY,
  2000
);

export const FILE_DEFAULT_PATH =
  import.meta.env.VITE_FILE_DEFAULT_PATH || "C:/Innotech";

export const POLL = {
  SYSTEM_OVERVIEW: envInt(import.meta.env.VITE_POLL_SYSTEM_OVERVIEW, 3000),
  CPU: envInt(import.meta.env.VITE_POLL_CPU, 2000),
  MEMORY: envInt(import.meta.env.VITE_POLL_MEMORY, 2000),
  DISK: envInt(import.meta.env.VITE_POLL_DISK, 10000),
  NETWORK: envInt(import.meta.env.VITE_POLL_NETWORK, 3000),
  PROCESSES: envInt(import.meta.env.VITE_POLL_PROCESSES, 5000),
  PM2: envInt(import.meta.env.VITE_POLL_PM2, 5000),
  JOBS: envInt(import.meta.env.VITE_POLL_JOBS, 15000),
  ALERTS: envInt(import.meta.env.VITE_POLL_ALERTS, 15000),
} as const;

export const LOCALE = import.meta.env.VITE_LOCALE || "vi-VN";
export const HISTORY_MAX_POINTS = envInt(
  import.meta.env.VITE_HISTORY_MAX_POINTS,
  60
);
