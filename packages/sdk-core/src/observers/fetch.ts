export type FetchHandlerData = {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  response?: Response;
  error?: unknown;
};

const handlers: Array<(data: FetchHandlerData) => void> = [];
let installed = false;

export function addFetchInstrumentationHandler(handler: (data: FetchHandlerData) => void) {
  handlers.push(handler);
  if (!installed) {
    installed = true;
    instrumentFetch();
  }
}

function instrumentFetch() {
  const originalFetch = window.fetch;

  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const { url, method } = resolveFetchArgs(args);
    const startTime = Date.now();

    try {
      const response = await originalFetch(...args);
      handlers.forEach(h => h({ url, method, startTime, endTime: Date.now(), response }));
      return response;
    } catch (error) {
      handlers.forEach(h => h({ url, method, startTime, endTime: Date.now(), error }));
      throw error;
    }
  };
}

function resolveFetchArgs(args: Parameters<typeof fetch>): { url: string; method: string } {
  const input = args[0];
  const init = args[1];
  let url = '';
  let method = 'GET';

  if (typeof input === 'string') url = input;
  else if (input instanceof URL) url = input.toString();
  else if (input instanceof Request) {
    url = input.url;
    method = input.method;
  }

  if (init?.method) method = init.method;
  return { url, method: method.toUpperCase() };
}