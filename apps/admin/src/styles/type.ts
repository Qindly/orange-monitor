//Admin 读 Issue 列表的数据结构,
//这个就是你左边点分类后，右边那一列展示的数据。
interface IssueListItem {
  id: string;
  projectId: string;
  category: 'js' | 'resource' | 'api';
  type: string;

  title: string;
  normalizedMessage: string;
  fingerprint: string;

  eventCount: number;
  affectedUsers: number;
  affectedPages: number;

  firstSeenAt: number;
  lastSeenAt: number;
  status: 'open' | 'resolved' | 'ignored';
}

//Admin 读 Issue 详情页的数据结构
interface IssueDetailResponse {
  issue: IssueListItem & {
    sampleEvent?: {
      id: string;
      message: string;
      stack?: string;
      url: string;
      timestamp: number;
    };
  };
}

// Admin 读某个 Issue 下 Event 列表的数据结构
interface IssueEventListItem {
  id: string;
  issueId: string;

  message: string;
  timestamp: number;
  url: string;

  userId?: string;
  sessionId?: string;

  type: string;
  category: 'js' | 'resource' | 'api';

  // 详情页折叠展示时用
  stack?: string;
  extra?: Record<string, unknown>;
  detail?: Record<string, unknown>;
}