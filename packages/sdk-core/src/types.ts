import type {
  EventDetails,
  IssueCategory,
  MonitorEventPayload,
  MonitorEventSource,
  PerformanceMetricName,
  PerformanceMetricPayload,
  PerformanceRating,
} from '@orange-monitor/protocol';

export type {
  EventDetails,
  IssueCategory,
  MonitorEventPayload,
  MonitorEventSource,
  PerformanceMetricName,
  PerformanceMetricPayload,
  PerformanceRating,
} from '@orange-monitor/protocol';

export interface ThrottleOptions {
  timeWindow: number;
  maxCount: number;
}

export interface MonitorOptions {
  dsn: string;
  projectId: string;
  release?: string;
  userId?: string;
  batchSize?: number;
  perfBatchSize?: number;
  flushInterval?: number;
  Handlers?: Handler[];
  denyUrls?: Array<string | RegExp>;
  allowUrls?: Array<string | RegExp>;
  ignoreErrors?: Array<string | RegExp>;
  beforeSend?: (event: MonitorEventPayload) => MonitorEventPayload | null;
  throttle?: ThrottleOptions;
}

export interface ManualCaptureOptions {
  extra?: Record<string, unknown>;
  normalizedMessage?: string;
  fingerprint?: string;
  details?: Partial<EventDetails>;
}

export interface Handler {
  name: string;
  setup(client: MonitorClient): void;
}

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

export interface PerformanceInput {
  metricName: PerformanceMetricName;
  value: number;
  rating: PerformanceRating;
  extra?: Record<string, unknown>;
}

export interface MonitorClient {
  capture(input: CaptureInput): void;
  capturePerformance(input: PerformanceInput): void;
}
