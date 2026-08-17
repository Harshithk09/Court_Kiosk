/**
 * Anonymous product analytics for kiosk outcomes.
 * Events: flow_start, stage_enter, node_view, flow_complete, ask_used, usefulness
 */
import { buildApiUrl, getApiHeaders } from './apiConfig';

const SESSION_KEY = 'kiosk_analytics_session_id';

export function getAnalyticsSessionId() {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) ||
        `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
}

/**
 * Fire-and-forget product event. Never throws to callers.
 */
export function trackEvent(eventName, { flowType = null, nodeId = null, properties = {} } = {}) {
  const payload = {
    session_id: getAnalyticsSessionId(),
    event_name: eventName,
    flow_type: flowType,
    node_id: nodeId,
    properties,
  };

  try {
    const body = JSON.stringify(payload);
    const url = buildApiUrl('/api/analytics/event');
    const headers = getApiHeaders();
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      // sendBeacon cannot set custom headers; backend allows unauthenticated kiosk analytics
      navigator.sendBeacon(url, blob);
      return;
    }
    fetch(url, { method: 'POST', headers, body, keepalive: true }).catch(() => {});
  } catch {
    // ignore
  }
}

export default trackEvent;
