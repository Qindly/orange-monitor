export interface MonitorOptions {
  dsn: string;
  projectId: string;
}
export interface MonitorEventPayload {
  projectId: string;
  type: 'js_error' | 'promise_error' | 'manual_error' | 'manual_message';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
}
class MonitorSDK {
  private options: MonitorOptions;
  constructor(options: MonitorOptions) {
    this.options = options;
  }
  init() {
    this.setupJSErrorListener();
    this.setupPromiseErrorListener();
  }

  private setupJSErrorListener() {
    window.addEventListener('error', (event) => {
      const payload: MonitorEventPayload = {
        projectId: this.options.projectId,
        type: 'js_error',
        message: event.message || 'Unknown JS Error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack || '',
        timestamp: Date.now(),
        url: window.location.href,
      };
      this.report(payload);
    });
  }

  private setupPromiseErrorListener() {
    window.addEventListener('unhandledrejection', (event) => {
      let message = 'Unhandled Promise Rejection';
      let stack = '';
      const reason = event.reason;
      if (reason instanceof Error) {
        message = reason.message;
        stack = reason.stack || '';
      } else if (typeof reason === 'string') {
        message = reason;
      } else {
        try {
          message = JSON.stringify(reason);
        } catch {
          message = String(reason);
        }
      }
      const payload: MonitorEventPayload = {
        projectId: this.options.projectId,
        type: 'promise_error',
        message,
        stack,
        timestamp: Date.now(),
        url: window.location.href,
      };
      this.report(payload);
    });
  }

  captureException(error: unknown) {
    let message = 'Unknown Error';
    let stack = '';
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack || '';
    } else if (typeof error === 'string') {
      message = error;
    } else {
      try {
        message = JSON.stringify(error);
      } catch {
        message = String(error);
      }
    }
    const payload: MonitorEventPayload = {
      projectId: this.options.projectId,
      type: 'manual_error',
      message,
      stack,
      timestamp: Date.now(),
      url: window.location.href,
    };
    this.report(payload);
  }

   captureMessage(message: string) {
    const payload: MonitorEventPayload = {
      projectId: this.options.projectId,
      type: 'manual_message',
      message,
      timestamp: Date.now(),
      url: window.location.href,
    };
    this.report(payload);
  }

  private report(payload: MonitorEventPayload) {
    fetch(this.options.dsn, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('监控上报失败:', err);
    });
  }

}

export function initMonitor(options: MonitorOptions) {
  const monitor = new MonitorSDK(options);
  monitor.init();
  return monitor;
}
export { MonitorSDK };


