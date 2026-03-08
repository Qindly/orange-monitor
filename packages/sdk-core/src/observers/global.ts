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
    const target = event.target as HTMLElement | null;
    // target 是 DOM 元素说明是资源错误，排除掉
    if (target && target !== (window as unknown)) return;

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