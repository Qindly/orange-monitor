export interface MonitorOptions {
  dsn: string;
  projectId: string;
}

export function initMonitor(options: MonitorOptions) {
  window.addEventListener('error', (event) => {
    const payload = {
      projectId: options.projectId,
      type: 'js_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack || '',
      timestamp: Date.now(),
      url: window.location.href,
    };

    fetch(options.dsn, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('上报失败:', err);
    });
  });
}
