import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for WebSocket connections with automatic reconnection
 * Falls back to polling if WebSocket is not available
 */
export const useWebSocket = (endpoint, options = {}) => {
  const {
    onMessage,
    onError,
    onOpen,
    onClose,
    enabled = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!enabled || !isMountedRef.current) return;

    try {
      // Get WebSocket URL from API config
      // Use the same base URL logic as apiConfig.js
      const getApiBaseUrl = () => {
        if (process.env.REACT_APP_API_URL) {
          return process.env.REACT_APP_API_URL;
        }
        if (typeof window !== 'undefined' && window.location) {
          const { hostname } = window.location;
          if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `http://localhost:${process.env.REACT_APP_BACKEND_PORT || '5001'}`;
          }
          return 'https://court-kiosk.onrender.com';
        }
        return 'https://court-kiosk.onrender.com';
      };
      
      const apiBaseUrl = getApiBaseUrl();
      // Convert http/https to ws/wss for WebSocket
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = apiBaseUrl.replace(/^https?:/, wsProtocol);
      
      // Create WebSocket connection (native WebSocket for now, can be upgraded to Socket.IO client)
      const ws = new WebSocket(`${wsUrl}${endpoint}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
        if (onOpen) onOpen();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (onClose) onClose();

        // Attempt to reconnect
        if (isMountedRef.current && reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setIsConnected(false);
    }
  }, [endpoint, enabled, reconnectAttempts, maxReconnectAttempts, reconnectInterval, onMessage, onError, onOpen, onClose]);

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
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

