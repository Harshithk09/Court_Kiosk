import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_CONFIG } from '../utils/apiConfig';

/**
 * Socket.IO hook aligned with Flask-SocketIO backend (/api/ws/queue namespace).
 * Falls back to polling when the connection is unavailable.
 */
export const useWebSocket = (endpoint, options = {}) => {
  const {
    onMessage,
    onError,
    onOpen,
    onClose,
    enabled = true,
    reconnectInterval = 5000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const isMountedRef = useRef(true);
  const handlersRef = useRef({ onMessage, onError, onOpen, onClose });

  useEffect(() => {
    handlersRef.current = { onMessage, onError, onOpen, onClose };
  }, [onMessage, onError, onOpen, onClose]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !isMountedRef.current) return;

    try {
      const apiBaseUrl = API_CONFIG.BASE_URL;
      const namespace = endpoint || '/api/ws/queue';

      const socket = io(`${apiBaseUrl}${namespace}`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: reconnectInterval,
        withCredentials: true,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        if (!isMountedRef.current) return;
        setIsConnected(true);
        handlersRef.current.onOpen?.();
      });

      socket.on('queue_update', (data) => {
        handlersRef.current.onMessage?.(data);
      });

      socket.on('disconnect', () => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        handlersRef.current.onClose?.();
      });

      socket.on('connect_error', (error) => {
        handlersRef.current.onError?.(error);
      });
    } catch (error) {
      console.error('Socket.IO connection failed:', error);
      setIsConnected(false);
      handlersRef.current.onError?.(error);
    }
  }, [endpoint, enabled, reconnectInterval]);

  const send = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event || 'request_update', data || {});
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (enabled) {
      connect();
    }

    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    send,
    disconnect,
    reconnect: connect,
  };
};

export default useWebSocket;
