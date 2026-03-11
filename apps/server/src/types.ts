import type {
  IssueCategory,
  MonitorEventPayload,
} from '@repo/protocol';

export type { MonitorEventPayload } from '@repo/protocol';

export interface StackFrame {
  filename?: string;
  functionName?: string;
  lineno?: number;
  colno?: number;
}

// 服务端归一化后的中间模型
// 它和 MonitorEventPayload 的区别是：
// 1. 已经经过 server 清洗和补全
// 2. 已经有服务端最终 groupingKey
// 3. 已经把 stack 拆成了结构化 stackFrames
// 4. 已经补出了 path / pageKey
export interface NormalizedIncomingEvent {
  eventId: string;
  projectId: string;

  fingerprint?: string; // SDK 上传上来的“建议分组依据”
  groupingKey: string; // 服务端最终用于归组 issue 的 key

  category: IssueCategory;
  type: string; // 用于展示的具体异常类型名

  title: string;
  message: string;
  normalizedMessage: string;

  rawStack?: string;
  stackFrames?: StackFrame[];
  stackTopFrame?: string;
  filename?: string;
  lineno?: number;
  colno?: number;

  timestamp: number;
  url: string;
  path?: string;
  pageKey?: string;

  userId?: string;
  sessionId?: string;

  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  details?: Record<string, unknown>;
}

// 一类异常
export interface IssueEntity {
  id: string;
  projectId: string;

  groupingKey: string; // 这个对应 issue 的最终分组 key

  category: IssueCategory; // “大的数据通道分类”
  type: string; // “类别内的具体错误类型”，例如 TypeError / HttpError

  title: string; // 给人看的摘要，不是分组依据本身
  normalizedMessage: string;

  // 聚合统计
  eventCount: number;
  affectedPages: number;
  affectedUsers: number;

  // 最新 / 首次时间
  firstSeenAt: number;
  lastSeenAt: number;

  // 状态
  status: 'open' | 'resolved' | 'ignored';

  createdAt: number;
  updatedAt: number;

  // issue 级别的稳定摘要信息
  details?: Record<string, unknown>;
}

// 一次发生
export interface EventEntity {
  id: string; // 服务端存储 id
  eventId: string; // SDK 生成的事件 id
  issueId: string;

  projectId: string;
  fingerprint: string; // SDK 上传上来的“建议分组依据”
  groupingKey: string; // 服务端最终用于归组 issue 的 key

  category: IssueCategory;
  type: string;

  title: string;
  message: string;
  normalizedMessage: string;

  rawStack?: string;
  stackFrames?: StackFrame[];
  stackTopFrame?: string;
  filename?: string;
  lineno?: number;
  colno?: number;

  timestamp: number;
  url: string;
  path?: string;
  pageKey?: string;

  userId?: string;
  sessionId?: string;

  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  details?: Record<string, unknown>;

  createdAt: number;
}
