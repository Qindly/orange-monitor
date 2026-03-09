export interface MonitorOptions {
  dsn: string;  //上报地址，必填项
  projectId: string;
  batchSize?: number;  //累计到多少就上报
  flushInterval?: number;  //刷新间隔
  // dedupeWindow?: number;  //去重窗口时间
  // dedupeBySession?: boolean;  //是否按会话去重
  Handlers?: Handler[];
}

export type MonitorEventType =
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
  type: MonitorEventType;
  category: IssueCategory;

  // issue 聚合关键字段
  title: string;
  message: string; //原始 message 例如 Request failed for userId=123 at 1719999999
  normalizedMessage: string; //规范化后的 message 例如 Request failed for userId={userId} at {timestamp}
  fingerprint: string;  //稳定指纹

  // 基础定位信息
  stack?: string;
  stackTopFrame?: string;
  filename?: string;
  lineno?: number;
  colno?: number;

  // 发生信息
  timestamp: number;
  url: string;

  // 用户/会话/页面维度
  userId?: string;
  sessionId?: string;

  // // 聚合统计字段（客户端去重用）
  // occurrenceCount?: number;
  // suppressedCount?: number;
  // firstSeen?: number;
  // lastSeen?: number;

  // 聚合辅助信息
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;

  details?: EventDetails;

}

//业务方上报时的可选项
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

// client.capture() 的入参，通用字段由 client 自动补全
export type CaptureInput = Omit<
  MonitorEventPayload,
  | 'eventId'
  | 'projectId'
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
