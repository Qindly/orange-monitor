import type {
  EventDetails,
  IssueCategory,
  MonitorEventPayload,
  MonitorEventSource,
} from '@orange-monitor/protocol';
export type { EventDetails, IssueCategory, MonitorEventPayload, MonitorEventSource } from '@orange-monitor/protocol';

export interface MonitorOptions {
  dsn: string; // 上报地址，必填项
  projectId: string;
  release?: string;
  userId?: string; // 用户标识，可选
  batchSize?: number; // 累计到多少就上报
  flushInterval?: number; // 刷新间隔
  Handlers?: Handler[];
}

// 业务方手动上报时的可选项
export interface ManualCaptureOptions {
  extra?: Record<string, unknown>;
  normalizedMessage?: string;
  fingerprint?: string;
  details?: Partial<EventDetails>;
}

// Handler 插件接口
export interface Handler {
  name: string;
  setup(client: MonitorClient): void;
}

// client.capture() 的入参
// 通用字段由 client 自动补全：
// - eventId
// - projectId
// - timestamp
// - url
// - sessionId
//
// 有些字段可以由 SDK normalize 阶段自动推导，所以这里做成可选：
// - category
// - title
// - normalizedMessage
// - fingerprint
// - stackTopFrame
export type CaptureInput = Omit<
  MonitorEventPayload,
  | 'eventId'
  | 'projectId'
  | 'release'
  | 'timestamp'
  | 'url'
  | 'sessionId'
  | 'category'
  | 'title'
  | 'normalizedMessage'
  | 'fingerprint'
  | 'stackTopFrame'
> & {
  category?: IssueCategory;
  title?: string;
  normalizedMessage?: string;
  fingerprint?: string;
  stackTopFrame?: string;
};

// 避免循环引用，在这里前向声明 MonitorClient 的最小接口
export interface MonitorClient {
  capture(input: CaptureInput): void;
}
