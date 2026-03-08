import { addResourceErrorObserver } from '../observers/global';
import type { Handler, MonitorClient } from '../types';

export const resourceErrorHandler = (): Handler => ({
  name: 'ResourceError',
  setup(client: MonitorClient) {
    addResourceErrorObserver(({ tagName, resourceUrl }) => {
      client.capture({
        type: 'resource_error',
        message: `Resource load failed: <${tagName}> ${resourceUrl}`,
        filename: resourceUrl,
        extra: { tagName, resourceUrl },
      });
    });
  },
});