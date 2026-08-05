import { useEffect, useRef, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

/**
 * Keeps the admin/attorney queue fresh without hammering the API.
 * Prefers WebSocket updates; polls as a fallback and slows down when
 * the tab is hidden or the socket is already connected.
 */
export function useQueueSync({
  sessionToken,
  fetchQueue,
  onQueueUpdate,
  enabled = true,
}) {
  const [isTabActive, setIsTabActive] = useState(
    typeof document === 'undefined' ? true : !document.hidden
  );
  const fetchQueueRef = useRef(fetchQueue);
  const onQueueUpdateRef = useRef(onQueueUpdate);

  useEffect(() => {
    fetchQueueRef.current = fetchQueue;
  }, [fetchQueue]);

  useEffect(() => {
    onQueueUpdateRef.current = onQueueUpdate;
  }, [onQueueUpdate]);

  useEffect(() => {
    const handleVisibility = () => setIsTabActive(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleMessage = useCallback((data) => {
    if (data?.type === 'queue_update') {
      onQueueUpdateRef.current?.(data);
    }
  }, []);

  const { isConnected } = useWebSocket('/api/ws/queue', {
    enabled: enabled && !!sessionToken,
    onMessage: handleMessage,
  });

  useEffect(() => {
    if (!enabled || !sessionToken) return undefined;

    let cancelled = false;
    let timeoutId = null;

    const getIntervalMs = () => {
      if (!isTabActive) return 60000;
      if (isConnected) return 45000; // heartbeat only; WS carries live updates
      return 8000;
    };

    const scheduleNext = () => {
      if (cancelled) return;
      timeoutId = setTimeout(async () => {
        try {
          await fetchQueueRef.current?.();
        } catch {
          // fetchQueue implementations usually handle errors themselves
        }
        scheduleNext();
      }, getIntervalMs());
    };

    (async () => {
      try {
        await fetchQueueRef.current?.();
      } catch {
        // ignore — next poll will retry
      }
      scheduleNext();
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [enabled, sessionToken, isTabActive, isConnected]);

  return { isConnected, isTabActive };
}

export default useQueueSync;
