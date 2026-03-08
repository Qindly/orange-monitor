export type TransportPayload = {
  projectId: string;
  events: unknown[];
};

// 返回 Promise，让调用方自己决定失败怎么办
export async function sendByFetch(dsn: string, payload: TransportPayload): Promise<void> {
  const res = await fetch(dsn, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
}

export function sendByBeacon(dsn: string, payload: TransportPayload): boolean {
  if (!navigator.sendBeacon) return false;
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  return navigator.sendBeacon(dsn, blob);
}