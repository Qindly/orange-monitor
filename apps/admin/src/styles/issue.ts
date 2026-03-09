export type IssueCategory = 'js' | 'resource' | 'api';

export type IssueType =
  | 'js_error'
  | 'promise_error'
  | 'resource_error'
  | 'http_error';

export interface IssueItem {
  id: string;
  projectId: string;
  category: IssueCategory;
  errorType: IssueType;
  title: string;
  fingerprint: string;
  normalizedMessage: string;
  totalCount: number;
  affectedUsers: number;
  affectedPages: number;
  lastSeenAt: string;
  status: 'open' | 'resolved' | 'ignored';
}

export interface IssueEventItem {
  id: string;
  issueId: string;
  userId: string;
  sessionId: string;
  pageUrl: string;
  message: string;
  stack?: string;
  triggerTime: string;
  occurrenceCount: number;
  extra?: Record<string, unknown>;
}
