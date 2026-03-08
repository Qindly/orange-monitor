import { addPromiseErrorHandler } from '../observers/globalHandlers';
import type { Integration, MonitorClient, CaptureInput } from '../types';

function extractReason(reason: unknown): { message: string; stack?: string } {
  if (reason instanceof Error) {
    return { message: reason.message, stack: reason.stack };
  }
  if (typeof reason === 'string') {
    return { message: reason };
  }
  try {
    return { message: JSON.stringify(reason) };
  } catch {
    return { message: String(reason) };
  }
}

export const promiseErrorIntegration = (): Integration => ({
  name: 'PromiseError',
  setup(client: MonitorClient) {
    addPromiseErrorHandler(({ reason }) => {
      const { message, stack } = extractReason(reason);
      const input: CaptureInput = {
        type: 'promise_error',
        message,
        stack,
      };
      client.capture(input);
    });
  },
});