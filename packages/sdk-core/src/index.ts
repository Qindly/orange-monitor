import { MonitorClient } from './client';
import { jsErrorIntegration } from './handlers/jsError';
import { promiseErrorIntegration } from './handlers/promiseError';
import { resourceErrorIntegration } from './handlers/resourceError';
import { httpErrorIntegration } from './handlers/httpError';
import type { MonitorOptions } from './types';

export type { MonitorOptions, MonitorEventPayload, MonitorEventType } from './types';
export { MonitorClient } from './client';

const defaultIntegrations = [
  jsErrorIntegration(),
  promiseErrorIntegration(),
  resourceErrorIntegration(),
  httpErrorIntegration(),
];

export function initMonitor(options: MonitorOptions): MonitorClient {
  const client = new MonitorClient(options);

  // 用户可传自定义 integrations，否则走默认
  const integrations = options.integrations ?? defaultIntegrations;
  integrations.forEach(integration => integration.setup(client));

  client.startTimer();

  window.addEventListener('beforeunload', () => {
    client.flush({ useBeacon: true });
  });

  return client;
}