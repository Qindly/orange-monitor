export interface MonitorOptions {
  dsn: string;
  projectId: string;
  batchSize?: number;
  flushInterval?: number;
  Handlers?: Handler[];

  // dedupe 窗口，默认一个页面会话内永久去重时可以不用它
  dedupeWindow?: number;

  // 是否开启 session 内同 issue 只报一次
  dedupeBySession?: boolean;
}

export type MonitorEventType =
  | 'js_error'
  | 'promise_error'
  | 'resource_error'
  | 'http_error'
  | 'manual_error'
  | 'manual_message';


export interface MonitorEventPayload {
  eventId: string;
  projectId: string;
  type: MonitorEventType;
  message: string;

  normalizedMessage?: string;
  fingerprint?: string;
  stack?: string;
  stackTopFrame?: string;

  filename?: string;
  lineno?: number;
  colno?: number;

  timestamp: number;
  url: string;
  extra?: Record<string, unknown>;

  occurrenceCount?: number;
  suppressedCount?: number;
  firstSeen?: number;
  lastSeen?: number;

}

export interface ManualCaptureOptions {
  extra?: Record<string, unknown>;
  normalizedMessage?: string;
  fingerprint?: string;
}


// Handler 插件接口
export interface Handler {
  name: string;
  setup(client: MonitorClient): void;
}

// client.capture() 的入参，通用字段由 client 自动补全
export type CaptureInput = Omit<
  MonitorEventPayload,
  'eventId' | 'projectId' | 'timestamp' | 'url'
>;

// 避免循环引用，在这里前向声明 MonitorClient 的最小接口
export interface MonitorClient {
  capture(input: CaptureInput): void;
}
