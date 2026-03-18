import { io } from "socket.io-client";
import {
  SOCKET_RECONNECT_ATTEMPTS,
  SOCKET_RECONNECT_DELAY,
  API_URL,
} from "./config";
import { getApiKey } from "./auth";

export const socket = io(API_URL, {
  autoConnect: false,
  auth: {
    apiKey: getApiKey(),
  },
  reconnection: true,
  reconnectionAttempts: SOCKET_RECONNECT_ATTEMPTS,
  reconnectionDelay: SOCKET_RECONNECT_DELAY,
});

export function connectSocket(): void {
  const key = getApiKey();
  socket.auth = { apiKey: key };

  if (socket.connected) {
    socket.disconnect();
  }
  socket.connect();
}

export function disconnectSocket(): void {
  socket.disconnect();
}
