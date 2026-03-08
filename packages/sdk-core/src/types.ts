export interface MonitorOptions {
  dsn: string;
  projectId: string;
  batchSize?: number;
  flushInterval?: number;
  Handlers?: Handler[];
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
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  extra?: Record<string, unknown>;
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
