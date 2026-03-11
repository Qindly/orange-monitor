import type { IssueEntity, NormalizedIncomingEvent } from '../types';
import { toNewIssueEntity } from '../domain/mapper';
import { findIssueByGroupingKey, insertIssue, updateIssue } from '../repositories/issue.repository';
import { registerAffectedPage, registerAffectedUser } from '../repositories/stats.repository';
import { createId } from '../utils/id';

export async function getOrCreateIssue(event: NormalizedIncomingEvent): Promise<IssueEntity> {
  const now = Date.now();
  const existing = await findIssueByGroupingKey(event.projectId, event.groupingKey);

  if (!existing) {
    const issue = toNewIssueEntity({
      id: createId('issue'),
      event,
      now,
    });

    await insertIssue(issue);
    await registerAffectedUser(issue.id, event.userId);
    await registerAffectedPage(issue.id, event.pageKey);
    return issue;
  }

  existing.eventCount += 1;
  existing.lastSeenAt = Math.max(existing.lastSeenAt, event.timestamp);
  existing.firstSeenAt = Math.min(existing.firstSeenAt, event.timestamp);
  existing.updatedAt = now;

  const isNewUser = await registerAffectedUser(existing.id, event.userId);
  if (isNewUser) {
    existing.affectedUsers += 1;
  }

  const isNewPage = await registerAffectedPage(existing.id, event.pageKey);
  if (isNewPage) {
    existing.affectedPages += 1;
  }

  await updateIssue(existing);
  return existing;
}
