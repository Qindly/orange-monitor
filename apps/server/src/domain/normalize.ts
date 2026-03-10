import { buildPageKey, extractPath } from './page';
import { parseStackFrames, getTopFrameText } from './stack';
import { computeGroupingKey } from './grouping';
import type { MonitorEventPayload } from '@repo/protocol';
import type { NormalizedIncomingEvent } from '../types';

export function normalizeIncomingEvent(payload: MonitorEventPayload): NormalizedIncomingEvent {
  const stackFrames = parseStackFrames(payload.stack);
  const stackTopFrame = payload.stackTopFrame || getTopFrameText(stackFrames);
  const path = extractPath(payload.url);
  const pageKey = buildPageKey(payload.url, path);

  const groupingKey = computeGroupingKey({
    projectId: payload.projectId,
    category: payload.category,
    type: payload.type,
    normalizedMessage: payload.normalizedMessage,
    stackTopFrame,
    filename: payload.filename,
    lineno: payload.lineno,
    colno: payload.colno,
    fingerprint: payload.fingerprint,
  });

  return {
    eventId: payload.eventId,
    projectId: payload.projectId,

    fingerprint: payload.fingerprint,
    groupingKey,

    category: payload.category,
    type: payload.type,

    title: payload.title,
    message: payload.message,
    normalizedMessage: payload.normalizedMessage,

    rawStack: payload.stack,
    stackFrames,
    stackTopFrame,
    filename: payload.filename,
    lineno: payload.lineno,
    colno: payload.colno,

    timestamp: payload.timestamp,
    url: payload.url,
    path,
    pageKey,

    userId: payload.userId,
    sessionId: payload.sessionId,

    tags: payload.tags,
    extra: payload.extra,
    details: payload.details as Record<string, unknown> | undefined,
  };
}