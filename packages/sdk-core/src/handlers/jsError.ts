import { addJSErrorHandler } from '../observers/globalHandlers';
import type { Integration, MonitorClient, CaptureInput } from '../types';

export const jsErrorIntegration = (): Integration => ({
  name: 'JSError',
  setup(client: MonitorClient) {
    addJSErrorHandler(({ message, filename, lineno, colno, error }) => {
      const input: CaptureInput = {
        type: 'js_error',
        message: message || 'Unknown JS Error',
        filename,
        lineno,
        colno,
        stack: error?.stack,
      };
      client.capture(input);
    });
  },
});