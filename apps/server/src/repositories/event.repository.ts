import type { EventEntity } from '../types';
import { prisma } from '../lib/prisma';
import { mapEventRowToEntity, optionalJsonInput, toBigInt } from './prisma.mapper';

export async function insertEvent(event: EventEntity): Promise<void> {
  await prisma.event.create({
    data: {
      id: event.id,
      eventId: event.eventId,
      issueId: event.issueId,
      projectId: event.projectId,
      fingerprint: event.fingerprint,
      groupingKey: event.groupingKey,
      category: event.category,
      type: event.type,
      title: event.title,
      message: event.message,
      normalizedMessage: event.normalizedMessage,
      rawStack: event.rawStack,
      stackFrames: optionalJsonInput(event.stackFrames),
      stackTopFrame: event.stackTopFrame,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: toBigInt(event.timestamp),
      url: event.url,
      path: event.path,
      pageKey: event.pageKey,
      userId: event.userId,
      sessionId: event.sessionId,
      tags: optionalJsonInput(event.tags),
      extra: optionalJsonInput(event.extra),
      details: optionalJsonInput(event.details),
      createdAt: toBigInt(event.createdAt),
    },
  });
}

export async function listEventsByIssueId(issueId: string): Promise<EventEntity[]> {
  const rows = await prisma.event.findMany({
    where: { issueId },
    orderBy: [{ timestamp: 'desc' }, { createdAt: 'desc' }],
  });

  return rows.map(mapEventRowToEntity);
}
