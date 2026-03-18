import { useEffect, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "../api/socket";

/**
 * Hook quản lý trạng thái kết nối WebSocket
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Kết nối khi mount
    connectSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      disconnectSocket();
    };
  }, []);

  return { isConnected, socket };
}

/**
 * Hook subscribe một event cụ thể từ socket
 */
export function useSocketEvent<T>(event: string, handler: (data: T) => void) {
  useEffect(() => {
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
}
