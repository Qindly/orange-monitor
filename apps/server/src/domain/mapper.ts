import type { EventEntity, IssueEntity, NormalizedIncomingEvent } from '../types';
import { buildIssueDetail } from './grouping';

export function toEventEntity(input: {
  id: string;
  issueId: string;
  event: NormalizedIncomingEvent;
  now: number;
}): EventEntity {
  const { id, issueId, event, now } = input;

  return {
    id,
    eventId: event.eventId,
    issueId,

    projectId: event.projectId,
    fingerprint: event.fingerprint || '',
    groupingKey: event.groupingKey,

    category: event.category,
    type: event.type,

    title: event.title,
    message: event.message,
    normalizedMessage: event.normalizedMessage,

    rawStack: event.rawStack,
    stackFrames: event.stackFrames,
    stackTopFrame: event.stackTopFrame,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,

    timestamp: event.timestamp,
    url: event.url,
    path: event.path,
    pageKey: event.pageKey,

    userId: event.userId,
    sessionId: event.sessionId,

    tags: event.tags,
    extra: event.extra,
    details: event.details,

    createdAt: now,
  };
}

export function toNewIssueEntity(input: {
  id: string;
  event: NormalizedIncomingEvent;
  now: number;
}): IssueEntity {
  const { id, event, now } = input;

  return {
    id,
    projectId: event.projectId,
    groupingKey: event.groupingKey,
    category: event.category,
    type: event.type,

    title: event.title,
    normalizedMessage: event.normalizedMessage,

    eventCount: 1,
    affectedPages: event.pageKey ? 1 : 0,
    affectedUsers: event.userId ? 1 : 0,

    firstSeenAt: event.timestamp,
    lastSeenAt: event.timestamp,

    status: 'open',

    createdAt: now,
    updatedAt: now,

    details: buildIssueDetail(event),
  };
}