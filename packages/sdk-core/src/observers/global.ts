import { createObserver } from './createObserver';

// ---------- JS 错误 ----------

export type JSErrorData = {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
};

export const addJSErrorObserver = createObserver<JSErrorData>((trigger) => {
  window.addEventListener('error', (event) => {
    const target = event.target;

    // 资源错误通常 target 是具体元素节点；JS 运行时错误通常 target 是 window
    if (target instanceof Element) return;

    trigger({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });
});

// ---------- Promise 错误 ----------

export type PromiseErrorData = {
  reason: unknown;
};

export const addPromiseErrorObserver = createObserver<PromiseErrorData>((trigger) => {
  window.addEventListener('unhandledrejection', (event) => {
    trigger({ reason: event.reason });
  });
});

// ---------- 资源错误 ----------

export type ResourceErrorData = {
  tagName: string;
  resourceUrl: string;
};

export const addResourceErrorObserver = createObserver<ResourceErrorData>((trigger) => {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target as HTMLElement | null;
      if (!target || target === (window as unknown)) return;

      let resourceUrl = '';
      const tagName = target.tagName?.toLowerCase() || 'unknown';

      if (target instanceof HTMLScriptElement) resourceUrl = target.src;
      else if (target instanceof HTMLLinkElement) resourceUrl = target.href;
      else if (target instanceof HTMLImageElement) resourceUrl = target.src;
      else return;

      trigger({ tagName, resourceUrl });
    },
    true
  );
});