import { addResourceErrorObserver } from '../observers/global';
import type { Handler, MonitorClient } from '../types';


function getResourceErrorType(tagName?: string): string {
  const tag = tagName?.toLowerCase();

  switch (tag) {
    case 'script':
      return 'ScriptLoadError';
    case 'img':
      return 'ImageLoadError';
    case 'link':
      return 'StyleLoadError';
    default:
      return 'ResourceLoadError';
  }
}

export const resourceErrorHandler = (): Handler => ({
  name: 'ResourceError',
  setup(client: MonitorClient) {
    addResourceErrorObserver(({ tagName, resourceUrl }) => {
      const type = getResourceErrorType(tagName);

      client.capture({
        eventSource: 'resource_error',
        category: 'resource',
        type,
        title: `${type}: ${resourceUrl}`,
        message: `Resource load failed: <${tagName}> ${resourceUrl}`,
        filename: resourceUrl,
        details: {
          resource: {
            tagName,
            resourceUrl,
          },
          runtime: {
            userAgent: navigator.userAgent,
            language: navigator.language,
          },
        },
      });
    });
  },
});