import { addJSErrorObserver } from '../observers/global';
import type { Handler, MonitorClient } from '../types';

export const jsErrorHandler = (): Handler => ({
  name: 'JSError',
  setup(client: MonitorClient) {
    addJSErrorObserver(({ message, filename, lineno, colno, error }) => {
      const errorMessage = message || 'Unknown JS Error';
      client.capture({
        type: 'js_error',
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