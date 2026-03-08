import { addFetchInstrumentationHandler } from '../observers/fetch';
import { addXhrInstrumentationHandler } from '../observers/xhr';
import type { Integration, MonitorClient, CaptureInput } from '../types';

export const httpErrorIntegration = (): Integration => ({
  name: 'HttpError',
  setup(client: MonitorClient) {
    // 消费 fetch 探针
    addFetchInstrumentationHandler(({ url, method, startTime, endTime, response, error }) => {
      const duration = endTime - startTime;

      if (error) {
        client.capture({
          type: 'http_error',
          message: error instanceof Error ? error.message : 'Fetch network error',
          stack: error instanceof Error ? error.stack : undefined,
          extra: { requestType: 'fetch', requestUrl: url, method, duration },
        });
        return;
      }

      if (response && !response.ok) {
        client.capture({
          type: 'http_error',
          message: `Fetch failed: ${response.status} ${response.statusText}`,
          extra: {
            requestType: 'fetch',
            requestUrl: url,
            method,
            status: response.status,
            statusText: response.statusText,
            duration,
          },
        });
      }
    });

    // 消费 xhr 探针
    addXhrInstrumentationHandler(({ url, method, startTime, endTime, status, statusText, isError }) => {
      const duration = endTime - startTime;
      const input: CaptureInput = isError
        ? {
            type: 'http_error',
            message: 'XHR network error',
            extra: { requestType: 'xhr', requestUrl: url, method, duration },
          }
        : status >= 400
          ? {
              type: 'http_error',
              message: `XHR failed: ${status} ${statusText}`,
              extra: { requestType: 'xhr', requestUrl: url, method, status, statusText, duration },
            }
          : null;

      if (input) client.capture(input);
    });
  },
});