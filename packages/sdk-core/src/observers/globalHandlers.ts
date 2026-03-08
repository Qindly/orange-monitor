// ---- 原始数据类型（给 integration 消费用）----

export type JSErrorData = {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
};

export type PromiseErrorData = {
  reason: unknown;
};

export type ResourceErrorData = {
  tagName: string;
  resourceUrl: string;
};

// ---- 每种事件只注册一次 ----

let jsErrorInstalled = false;
let promiseErrorInstalled = false;
let resourceErrorInstalled = false;

const jsErrorHandlers: Array<(data: JSErrorData) => void> = [];
const promiseErrorHandlers: Array<(data: PromiseErrorData) => void> = [];
const resourceErrorHandlers: Array<(data: ResourceErrorData) => void> = [];

export function addJSErrorHandler(handler: (data: JSErrorData) => void) {
  jsErrorHandlers.push(handler);
  if (!jsErrorInstalled) {
    jsErrorInstalled = true;
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLElement | null;
      // 资源错误走 capture 阶段，target 不是 window，排除掉
      if (target && target !== (window as unknown)) return;
      jsErrorHandlers.forEach(h =>
        h({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        })
      );
    });
  }
}

export function addPromiseErrorHandler(handler: (data: PromiseErrorData) => void) {
  promiseErrorHandlers.push(handler);
  if (!promiseErrorInstalled) {
    promiseErrorInstalled = true;
    window.addEventListener('unhandledrejection', (event) => {
      promiseErrorHandlers.forEach(h => h({ reason: event.reason }));
    });
  }
}

export function addResourceErrorHandler(handler: (data: ResourceErrorData) => void) {
  resourceErrorHandlers.push(handler);
  if (!resourceErrorInstalled) {
    resourceErrorInstalled = true;
    // capture 阶段才能捕获资源错误
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

        resourceErrorHandlers.forEach(h => h({ tagName, resourceUrl }));
      },
      true // capture 阶段
    );
  }
}