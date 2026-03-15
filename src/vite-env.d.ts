/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Server
  readonly VITE_API_URL: string;
  readonly VITE_API_KEY: string;
  // File Manager
  readonly VITE_FILE_DEFAULT_PATH: string;
  // Polling intervals (ms)
  readonly VITE_POLL_SYSTEM_OVERVIEW: string;
  readonly VITE_POLL_CPU: string;
  readonly VITE_POLL_MEMORY: string;
  readonly VITE_POLL_DISK: string;
  readonly VITE_POLL_NETWORK: string;
  readonly VITE_POLL_PROCESSES: string;
  readonly VITE_POLL_PM2: string;
  readonly VITE_POLL_JOBS: string;
  readonly VITE_POLL_ALERTS: string;
  // API Client
  readonly VITE_API_TIMEOUT: string;
  // Socket.IO
  readonly VITE_SOCKET_RECONNECT_ATTEMPTS: string;
  readonly VITE_SOCKET_RECONNECT_DELAY: string;
  // App Settings
  readonly VITE_LOCALE: string;
  readonly VITE_HISTORY_MAX_POINTS: string;
  // Gemini (existing)
  readonly GEMINI_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
