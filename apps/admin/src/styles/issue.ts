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

export interface IssueEventStackFrame {
  filename?: string;
  functionName?: string;
  lineno?: number;
  colno?: number;
  isSymbolicated?: boolean;
  generatedFilename?: string;
  generatedFunctionName?: string;
  generatedLineno?: number;
  generatedColno?: number;
  contextLine?: string;
  preContext?: string[];
  postContext?: string[];
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
  stackTopFrame?: string;
  stackFrames?: IssueEventStackFrame[];
  extra?: Record<string, unknown>;
  details?: Record<string, unknown>;
}
