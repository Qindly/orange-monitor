import { addJSErrorObserver } from '../observers/global';
import type { Handler, MonitorClient } from '../types';

export const jsErrorHandler = (): Handler => ({
  name: 'JSError',
  setup(client: MonitorClient) {
    addJSErrorObserver(({ message, filename, lineno, colno, error }) => {
      client.capture({
        type: 'js_error',
        message: message || 'Unknown JS Error',
        filename,
        lineno,
        colno,
        stack: error?.stack,
      });
    });
  },
});