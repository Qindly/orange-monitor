import { addPromiseErrorObserver } from '../observers/global';
import type { Handler, MonitorClient } from '../types';

type ReasonResult = { message: string; stack?: string; type: string };


const reasonParsers: Array<(reason: unknown) => ReasonResult | null> = [
  (r) =>
    r instanceof Error
      ? { message: r.message, stack: r.stack, type: r.name || 'Error' }
      : null,

  (r) =>
    typeof r === 'string'
      ? { message: r, type: 'UnhandledRejectionError' }
      : null,

  (r) => {
    try {
      return { message: JSON.stringify(r), type: 'UnhandledRejectionError' };
    } catch {
      return null;
    }
  },

  (r) => ({ message: String(r), type: 'UnhandledRejectionError' }),
];

function extractReason(reason: unknown): ReasonResult {
  for (const parser of reasonParsers) {
    const result = parser(reason);
    if (result) return result;
  }

  return { message: 'Unknown reason', type: 'UnhandledRejectionError' };
}

export const promiseErrorHandler = (): Handler => ({
  name: 'PromiseError',
  setup(client: MonitorClient) {
    addPromiseErrorObserver(({ reason }) => {
      const { message, stack, type } = extractReason(reason);

      client.capture({
        eventSource: 'promise_error',
        category: 'js',
        type,
        title: `${type}: ${message}`,
        message,
        stack,
        details: {
          reason,
          runtime: {
            userAgent: navigator.userAgent,
            language: navigator.language,
          },
        },
      });
    });
  },
});