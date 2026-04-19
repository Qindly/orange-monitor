import type {
  MonitorOptions,
  MonitorEventPayload,
  CaptureInput,
  ManualCaptureOptions,
  PerformanceInput,
  PerformanceMetricPayload,
} from './types';
import { createEventId } from './utils/createEventId';
import { BufferedQueue } from './utils/buffered-queue';
import { enrichCaptureInput } from './utils/normalize';
import { getSessionId } from './utils/session';
import { serializeError } from 'serialize-error';


type InternalMonitorOptions = Omit<MonitorOptions, 'Handlers' | 'userId'> & {
  batchSize: number;
  flushInterval: number;
  perfBatchSize: number;
};

interface ThrottleRecord {
  count: number;
  startTime: number;
}

function matchesPattern(value: string, pattern: string | RegExp): boolean {
  if (typeof pattern === 'string') {
    return value.includes(pattern);
  }
  return pattern.test(value);
}

function matchesAny(value: string, patterns: Array<string | RegExp>): boolean {
  return patterns.some(p => matchesPattern(value, p));
}

export class MonitorClient {
  private eventQueue: BufferedQueue<MonitorEventPayload>;
  private perfQueue: BufferedQueue<PerformanceMetricPayload>;
  private timer: ReturnType<typeof setInterval> | null = null;
  private options: InternalMonitorOptions;
  private sessionId: string;
  private userId?: string;
  private throttleMap: Map<string, ThrottleRecord> = new Map();

  constructor(options: MonitorOptions) {
    const { userId, Handlers, ...rest } = options;
    this.options = {
      batchSize: 3,
      flushInterval: 5000,
      perfBatchSize: 5,
      ...rest,
    };

    this.sessionId = getSessionId();
    this.userId = userId;

    // ── 异常事件队列 ──
    this.eventQueue = new BufferedQueue<MonitorEventPayload>({
      batchSize: this.options.batchSize,
      endpoint: this.options.dsn,
      buildPayload: (items) => ({
        projectId: this.options.projectId,
        sessionId: this.sessionId,
        events: items,
      }),
    });

    // ── 性能指标队列 ──
    this.perfQueue = new BufferedQueue<PerformanceMetricPayload>({
      batchSize: this.options.perfBatchSize,
      endpoint: this.options.dsn.replace(/\/ingest\/?$/, '/performance'),
      buildPayload: (items) => ({
        projectId: this.options.projectId,
        sessionId: this.sessionId,
        metrics: items,
      }),
    });
  }

  setUser(userId: string | undefined): void {
    this.userId = userId;
  }

  resetSession(): void {
    try {
      sessionStorage.removeItem('__monitor_session_id__');
    } catch {}
    this.sessionId = getSessionId();
  }

  capture(input: CaptureInput): void {
    const pageUrl = window.location.href;

    // ── 页面级过滤 ──
    // allowUrls 优先：配置了 allowUrls 时，不在白名单内的页面直接丢弃
    if (this.options.allowUrls?.length) {
      if (!matchesAny(pageUrl, this.options.allowUrls)) return;
    } else if (this.options.denyUrls?.length) {
      // 仅在未配置 allowUrls 时，denyUrls 才生效
      if (matchesAny(pageUrl, this.options.denyUrls)) return;
    }

    // ── 异常消息过滤 ──
    if (this.options.ignoreErrors?.length && input.message) {
      if (matchesAny(input.message, this.options.ignoreErrors)) return;
    }

    const enrichedInput = enrichCaptureInput(input);
    const now = Date.now();

    // ── 相同异常限流 ──
    if (this.options.throttle && enrichedInput.fingerprint) {
      if (this.isThrottled(enrichedInput.fingerprint, now)) return;
    }

    let event: MonitorEventPayload | null = {
      eventId: createEventId(),
      projectId: this.options.projectId,
      release: this.options.release,
      timestamp: now,
      url: pageUrl,
      sessionId: this.sessionId,
      ...(this.userId ? { userId: this.userId } : {}),
      ...enrichedInput,
    };

    // ── beforeSend 钩子 ──
    if (this.options.beforeSend) {
      event = this.options.beforeSend(event);
      if (!event) return;
    }

        this.eventQueue.push(event);
  }

  // ── 性能指标采集 ──

  capturePerformance(input: PerformanceInput): void {
    const metric: PerformanceMetricPayload = {
      eventId: createEventId(),
      projectId: this.options.projectId,
      release: this.options.release,
      timestamp: Date.now(),
      url: window.location.href,
      sessionId: this.sessionId,
      ...(this.userId ? { userId: this.userId } : {}),
      ...input,
    };

    this.perfQueue.push(metric);
  }

  // ── 定时器 & 生命周期 ──

  startTimer(): void {
    this.timer = setInterval(() => this.flushAll(), this.options.flushInterval);
  }

  /** 统一刷新所有队列 */
  flushAll(opts?: { useBeacon?: boolean }): void {
    this.eventQueue.flush(opts);
    this.perfQueue.flush(opts);
  }

  private isThrottled(fingerprint: string, now: number): boolean {
    const { timeWindow, maxCount } = this.options.throttle!;
    const record = this.throttleMap.get(fingerprint);

    if (!record || now - record.startTime >= timeWindow) {
      // 无记录或窗口已过期，重置计数
      this.throttleMap.set(fingerprint, { count: 1, startTime: now });
      return false;
    }

    record.count++;
    if (record.count > maxCount) {
      return true;
    }

    return false;
  }

    /** 仅刷新异常事件队列（保留向后兼容） */
  async flush(opts?: { useBeacon?: boolean }): Promise<void> {
    return this.eventQueue.flush(opts);
  }


  captureException(error: unknown, options?: ManualCaptureOptions): void {
    const serialized = serializeError(error);

    const message = serialized.message || 'Unknown error';
    const stack = serialized.stack;
    const errorType = serialized.name || 'Error';

    this.capture({
      eventSource: 'manual_error',
      type: errorType,
      title: `${errorType}: ${message}`,
      message,
      stack,
      extra: options?.extra,
      ...(options?.normalizedMessage
        ? { normalizedMessage: options.normalizedMessage }
        : {}),
      ...(options?.fingerprint ? { fingerprint: options.fingerprint } : {}),
      details: {
        runtime: {
          userAgent: navigator.userAgent,
          language: navigator.language,
        },
        ...options?.details,
      },
    });
  }

  captureMessage(message: string, options?: ManualCaptureOptions): void {
    this.capture({
      eventSource: 'manual_message',
      category: 'js',
      type: 'Message',
      title: message,
      message,
      extra: options?.extra,
      ...(options?.normalizedMessage
        ? { normalizedMessage: options.normalizedMessage }
        : {}),
      ...(options?.fingerprint ? { fingerprint: options.fingerprint } : {}),
      details: {
        runtime: {
          userAgent: navigator.userAgent,
          language: navigator.language,
        },
        ...options?.details,
      },
    });
  }

      destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    // 销毁前通过 beacon 发送所有残留数据
    this.flushAll({ useBeacon: true });
  }
}
