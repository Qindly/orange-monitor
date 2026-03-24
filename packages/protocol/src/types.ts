export type MonitorEventSource =
  | 'js_error'
  | 'promise_error'
  | 'resource_error'
  | 'http_error'
  | 'manual_error'
  | 'manual_message';

export type IssueCategory = 'js' | 'resource' | 'api';

export interface EventDetails {
  reason?: unknown;
  request?: {
    method?: string;
    url?: string;
    status?: number;
    statusText?: string;
    duration?: number;
    requestType?: 'fetch' | 'xhr';
  };
  resource?: {
    tagName?: string;
    resourceUrl?: string;
  };
  runtime?: {
    userAgent?: string;
    language?: string;
  };
}

export interface MonitorEventPayload {
  // 事件本身
  eventId: string;
  projectId: string;
  release?: string;

  // 用于展示的具体异常类型名
  // 例如：
  // js -> TypeError / ReferenceError / Error
  // api -> HttpError / NetworkError / TimeoutError
  // resource -> ScriptLoadError / ImageLoadError
  type: string;

  // 事件来源
  // 表示这个 event 是怎么被 SDK 捕获到的
  eventSource: MonitorEventSource;

  // 异常大类
  category: IssueCategory;

  // issue 聚合关键字段
  title: string;
  message: string; // 原始 message，例如 Request failed for userId=123 at 1719999999
  normalizedMessage: string; // 规范化后的 message，例如 Request failed for userId=<id> at <num>
  fingerprint: string; // SDK 生成的稳定指纹，服务端可作为建议分组依据

  // 基础定位信息
  stack?: string;
  stackTopFrame?: string;
  filename?: string;
  lineno?: number;
  colno?: number;

  // 发生信息
  timestamp: number;
  url: string;

  // 用户 / 会话维度
  userId?: string;
  sessionId?: string;

  // 聚合辅助信息
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  details?: EventDetails;
}

export interface MonitorIngestRequest {
  projectId: string;
  sessionId?: string;
  events: MonitorEventPayload[];
}

export interface MonitorIngestResponse {
  success: boolean;
  message?: string;
}
