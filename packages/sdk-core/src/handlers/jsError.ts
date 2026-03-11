import { addJSErrorObserver } from '../observers/global';
import type { Handler, MonitorClient } from '../types';


export const jsErrorHandler = (): Handler => ({
  name: 'JSError',
  setup(client: MonitorClient) {
    addJSErrorObserver(({ message, filename, lineno, colno, error }) => {
      const errorMessage = message || error?.message || 'Unknown JS Error';
      const errorType = error?.name || 'Error';

      client.capture({
        eventSource: 'js_error',
        category: 'js',
        type: errorType,
        title: `${errorType}: ${errorMessage}`,
        message: errorMessage,
        filename,
        lineno,
        colno,
        stack: error?.stack,
        details: {
          runtime: {
            userAgent: navigator.userAgent,
            language: navigator.language,
          },
        },
      });
    });
  },
});