import type {
  EventDetails,
  IssueCategory,
  MonitorEventPayload,
  MonitorEventSource,
} from '@orange-monitor/protocol';
export type { EventDetails, IssueCategory, MonitorEventPayload, MonitorEventSource } from '@orange-monitor/protocol';

export interface ThrottleOptions {
  /** 时间窗口（毫秒），在此窗口内对相同异常进行计数 */
  timeWindow: number;
  /** 时间窗口内允许上报的最大次数，超出则丢弃 */
  maxCount: number;
}

export interface MonitorOptions {
  dsn: string; // 上报地址，必填项
  projectId: string;
  release?: string;
  userId?: string; // 用户标识，可选
  batchSize?: number; // 累计到多少就上报
  flushInterval?: number; // 刷新间隔
  Handlers?: Handler[];

  // ── 过滤与屏蔽 ──

  /** 页面屏蔽：匹配当前页面 URL 则不上报（字符串或正则） */
  denyUrls?: Array<string | RegExp>;
  /** 页面白名单：仅匹配的页面 URL 才上报（优先级高于 denyUrls） */
  allowUrls?: Array<string | RegExp>;
  /** 异常消息过滤：匹配 message 的异常将被丢弃 */
  ignoreErrors?: Array<string | RegExp>;
  /** 上报前钩子：返回 null 则丢弃该事件，可修改事件内容 */
  beforeSend?: (event: MonitorEventPayload) => MonitorEventPayload | null;

  // ── 限流 ──

  /** 相同异常上报限流，不传则不启用限流 */
  throttle?: ThrottleOptions;
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
