// 给 XHR 实例挂私有字段用的 key
const XHR_DATA_KEY = '__monitor_xhr__';

type XhrPrivateData = {
  url: string;
  method: string;
  startTime: number;
};

export type XhrHandlerData = {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  status: number;
  statusText: string;
  isError: boolean; // true = 网络错误，false = 有 HTTP 响应
};

const handlers: Array<(data: XhrHandlerData) => void> = [];
let installed = false;

export function addXhrInstrumentationHandler(handler: (data: XhrHandlerData) => void) {
  handlers.push(handler);
  if (!installed) {
    installed = true;
    instrumentXhr();
  }
}

function instrumentXhr() {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    (this as any)[XHR_DATA_KEY] = {
      url: String(url),
      method: method.toUpperCase(),
    } satisfies Partial<XhrPrivateData>;
    return originalOpen.call(this, method, url, ...rest as any);
  };

  XMLHttpRequest.prototype.send = function (body) {
    const meta = (this as any)[XHR_DATA_KEY] as XhrPrivateData | undefined;
    if (!meta) return originalSend.call(this, body);

    meta.startTime = Date.now();

    this.addEventListener('loadend', () => {
      handlers.forEach(h =>
        h({
          url: meta.url,
          method: meta.method,
          startTime: meta.startTime,
          endTime: Date.now(),
          status: this.status,
          statusText: this.statusText,
          isError: false,
        })
      );
    });

    this.addEventListener('error', () => {
      handlers.forEach(h =>
        h({
          url: meta.url,
          method: meta.method,
          startTime: meta.startTime,
          endTime: Date.now(),
          status: 0,
          statusText: '',
          isError: true,
        })
      );
    });

    return originalSend.call(this, body);
  };
}