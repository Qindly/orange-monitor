import { MonitorClient } from './client';
import { jsErrorHandler } from './handlers/jsError';
import { promiseErrorHandler } from './handlers/promiseError';
import { resourceErrorHandler } from './handlers/resourceError';
import { httpErrorHandler } from './handlers/httpError';
import type { MonitorOptions } from './types';

export type {
  MonitorOptions,
  MonitorEventPayload,
  MonitorEventType,
  IssueCategory,
  CaptureInput,
  EventDetails,
  ManualCaptureOptions,
} from './types';
export { MonitorClient } from './client';

const defaultHandlers = [
  jsErrorHandler(),
  promiseErrorHandler(),
  resourceErrorHandler(),
  httpErrorHandler(),
];

export function initMonitor(options: MonitorOptions): MonitorClient {
  const client = new MonitorClient(options);

  // 用户可传自定义 Handlers，否则走默认
  const Handlers = options.Handlers ?? defaultHandlers;
  Handlers.forEach(Handler => Handler.setup(client));

  client.startTimer();

  window.addEventListener('beforeunload', () => {
    client.flush({ useBeacon: true });
  });

  return client;
}