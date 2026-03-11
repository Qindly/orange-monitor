import { createObserver } from './createObserver';

export type XhrData = {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  status: number;
  statusText: string;
  isError: boolean;
};

const XHR_META_KEY = '__monitor_xhr__';

type XhrMeta = {
  url: string;
  method: string;
  startTime: number;
};

export const addXhrObserver = createObserver<XhrData>((trigger) => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    async?: boolean,
    username?: string | null,
    password?: string | null
  ) {
    (this as any)[XHR_META_KEY] = {
      url: String(url),
      method: method.toUpperCase(),
    } satisfies Partial<XhrMeta>;

    return originalOpen.call(
      this,
      method,
      url,
      async ?? true,
      username ?? undefined,
      password ?? undefined
    );
  };

  XMLHttpRequest.prototype.send = function (body) {
    const meta = (this as any)[XHR_META_KEY] as XhrMeta | undefined;
    if (!meta) return originalSend.call(this, body);

    meta.startTime = Date.now();

    this.addEventListener('loadend', () => {
      trigger({
        url: meta.url,
        method: meta.method,
        startTime: meta.startTime,
        endTime: Date.now(),
        status: this.status,
        statusText: this.statusText,
        isError: false,
      });
    });

    this.addEventListener('error', () => {
      trigger({
        url: meta.url,
        method: meta.method,
        startTime: meta.startTime,
        endTime: Date.now(),
        status: 0,
        statusText: '',
        isError: true,
      });
    });

    return originalSend.call(this, body);
  };
});
