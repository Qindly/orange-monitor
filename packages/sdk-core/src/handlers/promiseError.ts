import { addPromiseErrorObserver } from '../observers/global';
import type { Handler, MonitorClient } from '../types';

type ReasonResult = { message: string; stack?: string };

// 每个解析器：能处理返回结果，不能处理返回 null
const reasonParsers: Array<(reason: unknown) => ReasonResult | null> = [
  (r) =>
    r instanceof Error
      ? { message: r.message, stack: r.stack }
      : null,

  (r) =>
    typeof r === 'string'
      ? { message: r }
      : null,

  (r) => {
    try {
      return { message: JSON.stringify(r) };
    } catch {
      return null;
    }
  },

  (r) => ({ message: String(r) }),
];

function extractReason(reason: unknown): ReasonResult {
  for (const parser of reasonParsers) {
    const result = parser(reason);
    if (result) return result;
  }

  return { message: 'Unknown reason' };
}

export const promiseErrorHandler = (): Handler => ({
  name: 'PromiseError',
  setup(client: MonitorClient) {
    addPromiseErrorObserver(({ reason }) => {
      const { message, stack } = extractReason(reason);

      client.capture({
        type: 'promise_error',
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