import type { IssueEntity } from '../types';
import { prisma } from '../lib/prisma';
import { mapIssueRowToEntity, optionalJsonInput, toBigInt } from './prisma.mapper';

export async function findIssueByGroupingKey(
  projectId: string,
  groupingKey: string
): Promise<IssueEntity | null> {
  const row = await prisma.issue.findUnique({
    where: {
      projectId_groupingKey: {
        projectId,
        groupingKey,
      },
    },
  });

  return row ? mapIssueRowToEntity(row) : null;
}

export async function insertIssue(issue: IssueEntity): Promise<void> {
  await prisma.issue.create({
    data: {
      id: issue.id,
      projectId: issue.projectId,
      groupingKey: issue.groupingKey,
      category: issue.category,
      type: issue.type,
      title: issue.title,
      normalizedMessage: issue.normalizedMessage,
      eventCount: issue.eventCount,
      affectedPages: issue.affectedPages,
      affectedUsers: issue.affectedUsers,
      firstSeenAt: toBigInt(issue.firstSeenAt),
      lastSeenAt: toBigInt(issue.lastSeenAt),
      status: issue.status,
      createdAt: toBigInt(issue.createdAt),
      updatedAt: toBigInt(issue.updatedAt),
      details: optionalJsonInput(issue.details),
    },
  });
}

export async function updateIssue(issue: IssueEntity): Promise<void> {
  await prisma.issue.update({
    where: { id: issue.id },
    data: {
      category: issue.category,
      type: issue.type,
      title: issue.title,
      normalizedMessage: issue.normalizedMessage,
      eventCount: issue.eventCount,
      affectedPages: issue.affectedPages,
      affectedUsers: issue.affectedUsers,
      firstSeenAt: toBigInt(issue.firstSeenAt),
      lastSeenAt: toBigInt(issue.lastSeenAt),
      status: issue.status,
      updatedAt: toBigInt(issue.updatedAt),
      details: optionalJsonInput(issue.details),
    },
  });
}

export async function listIssues(): Promise<IssueEntity[]> {
  const rows = await prisma.issue.findMany({
    orderBy: [{ lastSeenAt: 'desc' }, { createdAt: 'desc' }],
  });

  return rows.map(mapIssueRowToEntity);
}
