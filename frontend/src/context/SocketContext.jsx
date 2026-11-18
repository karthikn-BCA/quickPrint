import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const s = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = s;

    s.on('connect', () => {
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  /**
   * Helper for tracking pages to join an order room and receive real-time status updates
   */
  const joinOrderRoom = useCallback((orderId, onUpdate) => {
    if (!orderId) return () => {};

    const cleanId = String(orderId).trim().toUpperCase();
    const currentSocket = socketRef.current || socket;

    if (!currentSocket) {
      return () => {};
    }

    // Join room on backend
    currentSocket.emit('join_order_room', cleanId);
    currentSocket.emit('join:order', cleanId);

    const handleUpdate = (data) => {
      if (!data) return;
      const updatedOrder = data.order || data;
      const matchId = (data.orderId || updatedOrder.orderId || '').toUpperCase();
      if (!matchId || matchId === cleanId) {
        if (typeof onUpdate === 'function') {
          onUpdate(updatedOrder);
        }
      }
    };

    currentSocket.on('order_status_updated', handleUpdate);
    currentSocket.on('order:updated', handleUpdate);
    currentSocket.on(`order:${cleanId}:update`, handleUpdate);

    return () => {
      if (currentSocket) {
        currentSocket.off('order_status_updated', handleUpdate);
        currentSocket.off('order:updated', handleUpdate);
        currentSocket.off(`order:${cleanId}:update`, handleUpdate);
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinOrderRoom }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    return {
      socket: null,
      isConnected: false,
      joinOrderRoom: () => () => {},
    };
  }
  return context;
}

