import type { IssueEntity } from '../types';

const issues: IssueEntity[] = [];

export async function findIssueByGroupingKey(
  projectId: string,
  groupingKey: string
): Promise<IssueEntity | null> {
  return issues.find(
    (item) => item.projectId === projectId && item.groupingKey === groupingKey
  ) || null;
}

export async function insertIssue(issue: IssueEntity): Promise<void> {
  issues.push(issue);
}

export async function updateIssue(issue: IssueEntity): Promise<void> {
  const index = issues.findIndex((item) => item.id === issue.id);
  if (index >= 0) {
    issues[index] = issue;
  }
}

export async function listIssues(): Promise<IssueEntity[]> {
  return issues;
}