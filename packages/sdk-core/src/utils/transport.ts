import stringify from 'safe-stable-stringify';

/**
 * 通用 fetch 上报
 *
 * payload 本身就是 Record<string, unknown>，
 * 由 BufferedQueue 的 buildPayload 负责构建具体结构。
 */
export async function send(url: string, payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: stringify(payload),
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
}

/**
 * 通用 Beacon 上报（页面卸载时使用）
 *
 * @returns 是否成功调用 navigator.sendBeacon
 */
export function sendBeacon(url: string, payload: Record<string, unknown>): boolean {
  if (!navigator.sendBeacon) return false;
  const jsonString = stringify(payload);
  if (!jsonString) return false;
  const blob = new Blob([jsonString], { type: 'application/json' });
  return navigator.sendBeacon(url, blob);
}