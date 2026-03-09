import { addFetchObserver, type FetchData } from '../observers/fetch';
import { addXhrObserver, type XhrData } from '../observers/xhr';
import type { Handler, MonitorClient, CaptureInput } from '../types';

function buildFromFetch(data: FetchData): CaptureInput | null {
  const { url, method, startTime, endTime, response, error } = data;
  const duration = endTime - startTime;

  if (error) {
    return {
      type: 'http_error',
      message: error instanceof Error ? error.message : 'Fetch network error',
      stack: error instanceof Error ? error.stack : undefined,
      details: {
        request: {
          method,
          url,
          duration,
          requestType: 'fetch',
        },
        runtime: {
          userAgent: navigator.userAgent,
          language: navigator.language,

        },
      },
    };
  }

  if (response && !response.ok) {
    return {
      type: 'http_error',
      message: `Fetch failed: ${response.status} ${response.statusText}`,
      details: {
        request: {
          method,
          url,
          status: response.status,
          statusText: response.statusText,
          duration,
          requestType: 'fetch',
        },
        runtime: {
          userAgent: navigator.userAgent,
          language: navigator.language,
        },
      },
    };
  }

  return null;
}

function buildFromXhr(data: XhrData): CaptureInput | null {
  const { url, method, startTime, endTime, status, statusText, isError } = data;
  const duration = endTime - startTime;

  if (isError) {
    return {
      type: 'http_error',
      message: 'XHR network error',
      details: {
        request: {
          method,
          url,
          duration,
          requestType: 'xhr',
        },
        runtime: {
          userAgent: navigator.userAgent,
          language: navigator.language,
        
        },
      },
    };
  }

  if (status >= 400) {
    return {
      type: 'http_error',
      message: `XHR failed: ${status} ${statusText}`,
      details: {
        request: {
          method,
          url,
          status,
          statusText,
          duration,
          requestType: 'xhr',
        },
        runtime: {
          userAgent: navigator.userAgent,
          language: navigator.language,

        },
      },
    };
  }

  return null;
}

export const httpErrorHandler = (): Handler => ({
  name: 'HttpError',
  setup(client: MonitorClient) {
    addFetchObserver((data) => {
      const input = buildFromFetch(data);
      if (input) client.capture(input);
    });

    addXhrObserver((data) => {
      const input = buildFromXhr(data);
      if (input) client.capture(input);
    });
  },
});