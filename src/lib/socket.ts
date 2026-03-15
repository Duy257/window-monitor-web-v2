import { io } from 'socket.io-client';
import { SOCKET_RECONNECT_ATTEMPTS, SOCKET_RECONNECT_DELAY } from '../config';
import { getApiKey } from './auth';

/**
 * Singleton Socket.IO client
 * Kết nối tới server tại cùng origin (nhờ Vite proxy)
 */
export const socket = io('/', {
  autoConnect: false, // Kết nối thủ công sau khi có API key
  auth: {
    apiKey: getApiKey(),
  },
  reconnection: true,
  reconnectionAttempts: SOCKET_RECONNECT_ATTEMPTS,
  reconnectionDelay: SOCKET_RECONNECT_DELAY,
});

/**
 * Kết nối socket với API key hiện tại
 */
export function connectSocket(): void {
  const key = getApiKey();
  // Luôn cập nhật auth trước khi connect
  socket.auth = { apiKey: key };

  if (socket.connected) {
    // Force reconnect để gửi lại auth mới
    socket.disconnect();
  }
  socket.connect();
}

/**
 * Ngắt kết nối socket
 */
export function disconnectSocket(): void {
  socket.disconnect();
}
