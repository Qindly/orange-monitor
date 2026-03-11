import { addPromiseErrorObserver } from '../observers/global';
import type { Handler, MonitorClient } from '../types';
import { serializeError } from 'serialize-error';

type ReasonResult = { message: string; stack?: string; type: string };


function extractReason(reason: unknown): ReasonResult {
  // 使用 serialize-error 统一序列化
  const serialized = serializeError(reason);

  if (serialized.name && serialized.message) {
    return {
      message: serialized.message,
      stack: serialized.stack,
      type: serialized.name,
    };
  }

  // 降级处理
  if (typeof reason === 'string') {
    return { message: reason, type: 'UnhandledRejectionError' };
  }

  return {
    message: serialized.message || 'Unknown reason',
    type: 'UnhandledRejectionError'
  };
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