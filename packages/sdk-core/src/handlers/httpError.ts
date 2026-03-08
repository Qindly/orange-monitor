import { addFetchObserver, type FetchData } from '../observers/fetch';
import { addXhrObserver, type XhrData } from '../observers/xhr';
import type { Handler, MonitorClient, CaptureInput } from '../types';

function buildFromFetch(data: FetchData): CaptureInput | null {
  const { url, method, startTime, endTime, response, error } = data;
  const duration = endTime - startTime;
  const base = { requestType: 'fetch' as const, requestUrl: url, method, duration };

  if (error) {
    return {
      type: 'http_error',
      message: error instanceof Error ? error.message : 'Fetch network error',
      stack: error instanceof Error ? error.stack : undefined,
      extra: base,
    };
  }
  if (response && !response.ok) {
    return {
      type: 'http_error',
      message: `Fetch failed: ${response.status} ${response.statusText}`,
      extra: { ...base, status: response.status, statusText: response.statusText },
    };
  }
  return null;
}

function buildFromXhr(data: XhrData): CaptureInput | null {
  const { url, method, startTime, endTime, status, statusText, isError } = data;
  const duration = endTime - startTime;
  const base = { requestType: 'xhr' as const, requestUrl: url, method, duration };

  if (isError) {
    return { type: 'http_error', message: 'XHR network error', extra: base };
  }
  if (status >= 400) {
    return {
      type: 'http_error',
      message: `XHR failed: ${status} ${statusText}`,
      extra: { ...base, status, statusText },
    };
  }
  return null;
}

export const httpErrorHandler = (): Handler => ({
  name: 'HttpError',
  setup(client: MonitorClient) {
    addFetchObserver(data => {
      const input = buildFromFetch(data);
      if (input) client.capture(input);
    });

    addXhrObserver(data => {
      const input = buildFromXhr(data);
      if (input) client.capture(input);
    });
  },
});