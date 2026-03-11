import { Prisma } from '@prisma/client';
import type { EventEntity, IssueEntity, StackFrame } from '../types';

type JsonObject = Record<string, unknown>;

function jsonValueFromUnknown(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function recordFromJson(value: Prisma.JsonValue | null): JsonObject | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  return value as JsonObject;
}

function stringRecordFromJson(value: Prisma.JsonValue | null): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string') {
      result[key] = item;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function stackFramesFromJson(value: Prisma.JsonValue | null): StackFrame[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value as StackFrame[];
}

function toNumber(value: bigint): number {
  return Number(value);
}

export function toBigInt(value: number): bigint {
  return BigInt(Math.trunc(value));
}

export function optionalJsonInput(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  return jsonValueFromUnknown(value);
}

export function mapIssueRowToEntity(row: {
  id: string;
  projectId: string;
  groupingKey: string;
  category: string;
  type: string;
  title: string;
  normalizedMessage: string;
  eventCount: number;
  affectedPages: number;
  affectedUsers: number;
  firstSeenAt: bigint;
  lastSeenAt: bigint;
  status: string;
  createdAt: bigint;
  updatedAt: bigint;
  details: Prisma.JsonValue | null;
}): IssueEntity {
  return {
    id: row.id,
    projectId: row.projectId,
    groupingKey: row.groupingKey,
    category: row.category as IssueEntity['category'],
    type: row.type,
    title: row.title,
    normalizedMessage: row.normalizedMessage,
    eventCount: row.eventCount,
    affectedPages: row.affectedPages,
    affectedUsers: row.affectedUsers,
    firstSeenAt: toNumber(row.firstSeenAt),
    lastSeenAt: toNumber(row.lastSeenAt),
    status: row.status as IssueEntity['status'],
    createdAt: toNumber(row.createdAt),
    updatedAt: toNumber(row.updatedAt),
    details: recordFromJson(row.details),
  };
}

export function mapEventRowToEntity(row: {
  id: string;
  eventId: string;
  issueId: string;
  projectId: string;
  fingerprint: string;
  groupingKey: string;
  category: string;
  type: string;
  title: string;
  message: string;
  normalizedMessage: string;
  rawStack: string | null;
  stackFrames: Prisma.JsonValue | null;
  stackTopFrame: string | null;
  filename: string | null;
  lineno: number | null;
  colno: number | null;
  timestamp: bigint;
  url: string;
  path: string | null;
  pageKey: string | null;
  userId: string | null;
  sessionId: string | null;
  tags: Prisma.JsonValue | null;
  extra: Prisma.JsonValue | null;
  details: Prisma.JsonValue | null;
  createdAt: bigint;
}): EventEntity {
  return {
    id: row.id,
    eventId: row.eventId,
    issueId: row.issueId,
    projectId: row.projectId,
    fingerprint: row.fingerprint,
    groupingKey: row.groupingKey,
    category: row.category as EventEntity['category'],
    type: row.type,
    title: row.title,
    message: row.message,
    normalizedMessage: row.normalizedMessage,
    rawStack: row.rawStack ?? undefined,
    stackFrames: stackFramesFromJson(row.stackFrames),
    stackTopFrame: row.stackTopFrame ?? undefined,
    filename: row.filename ?? undefined,
    lineno: row.lineno ?? undefined,
    colno: row.colno ?? undefined,
    timestamp: toNumber(row.timestamp),
    url: row.url,
    path: row.path ?? undefined,
    pageKey: row.pageKey ?? undefined,
    userId: row.userId ?? undefined,
    sessionId: row.sessionId ?? undefined,
    tags: stringRecordFromJson(row.tags),
    extra: recordFromJson(row.extra),
    details: recordFromJson(row.details),
    createdAt: toNumber(row.createdAt),
  };
}
