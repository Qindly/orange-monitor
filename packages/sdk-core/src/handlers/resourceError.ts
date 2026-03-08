import { addResourceErrorHandler } from '../observers/globalHandlers';
import type { Integration, MonitorClient, CaptureInput } from '../types';

export const resourceErrorIntegration = (): Integration => ({
  name: 'ResourceError',
  setup(client: MonitorClient) {
    addResourceErrorHandler(({ tagName, resourceUrl }) => {
      const input: CaptureInput = {
        type: 'resource_error',
        message: `Resource load failed: <${tagName}> ${resourceUrl}`,
        filename: resourceUrl,
        extra: { tagName, resourceUrl },
      };
      client.capture(input);
    });
  },
});