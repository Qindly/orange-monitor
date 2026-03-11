import { hashString } from '../utils/hash';
import type { NormalizedIncomingEvent } from '../types';

function normalizeForGrouping(value?: string): string {
  return (value || '').trim().toLowerCase();
}

export function computeGroupingKey(input: {
  projectId: string;
  category: string;
  type: string;
  normalizedMessage: string;
  stackTopFrame?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  fingerprint?: string;
}): string {
  // 若业务显式指定 fingerprint，可优先采用
  if (input.fingerprint) {
    return hashString(`${input.projectId}|fp|${input.fingerprint}`);
  }

  const location =
    input.stackTopFrame ||
    [input.filename, input.lineno, input.colno]
      .filter((item) => item !== undefined && item !== '')
      .join(':') ||
    'no_location';

  const source = [
    input.projectId,
    normalizeForGrouping(input.category),
    normalizeForGrouping(input.type),
    normalizeForGrouping(input.normalizedMessage),
    normalizeForGrouping(location),
  ].join('|');

  return hashString(source);
}

export function buildIssueDetail(event: NormalizedIncomingEvent): Record<string, unknown> | undefined {
  if (event.category === 'api') {
    const request = event.details?.request as Record<string, unknown> | undefined;
    if (!request) return undefined;

    return {
      method: request.method,
      url: request.url,
      status: request.status,
      requestType: request.requestType,
    };
  }

  if (event.category === 'resource') {
    const resource = event.details?.resource as Record<string, unknown> | undefined;
    if (!resource) return undefined;

    return {
      tagName: resource.tagName,
      resourceUrl: resource.resourceUrl,
    };
  }

  if (event.category === 'js') {
    return {
      errorName: event.type,
    };
  }

  return undefined;
}