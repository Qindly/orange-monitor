export type IssueCategory = 'js' | 'resource' | 'api';

export interface IssueItem {
  id: string;
  projectId: string;
  groupingKey: string;
  category: IssueCategory;
  type: string;

  title: string;
  normalizedMessage: string;

  eventCount: number;
  affectedUsers: number;
  affectedPages: number;

  firstSeenAt: number;
  lastSeenAt: number;

  status: 'open' | 'resolved' | 'ignored';

  details?: Record<string, unknown>;
}

export interface IssueEventItem {
  id: string;
  eventId: string;
  issueId: string;

  category: IssueCategory;
  type: string;

  message: string;
  timestamp: number;
  url: string;

  userId?: string;
  sessionId?: string;

  rawStack?: string;
  extra?: Record<string, unknown>;
  details?: Record<string, unknown>;
}
