export type TransportPayload = {
  projectId: string;
  events: unknown[];
};

export function sendByFetch(dsn: string, payload: TransportPayload, onFailure: () => void) {
  fetch(dsn, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    console.error('[Monitor] 上报失败');
    onFailure();
  });
}

export function sendByBeacon(dsn: string, payload: TransportPayload): boolean {
  if (!navigator.sendBeacon) return false;
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  return navigator.sendBeacon(dsn, blob);
}