import type {
  MonitorOptions,
  MonitorEventPayload,
  CaptureInput,
  ManualCaptureOptions,
} from './types';
import { createEventId } from './utils/createEventId';
import { sendByFetch, sendByBeacon } from './utils/transport';
import { enrichCaptureInput } from './utils/normalize';
import { getSessionId } from './utils/session';
import { serializeError } from 'serialize-error';
import stringify from 'safe-stable-stringify';

export class MonitorClient {
  private queue: MonitorEventPayload[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private options: Required<Omit<MonitorOptions, 'Handlers'>>;
  private sessionId: string;

  constructor(options: MonitorOptions) {
    this.options = {
      batchSize: 3,
      flushInterval: 5000,
      // dedupeWindow: 10000,
      // dedupeBySession: true,
      ...options,
    };

    this.sessionId = getSessionId();
  }

  capture(input: CaptureInput): void {
    const enrichedInput = enrichCaptureInput(input);
    const now = Date.now();

    const event: MonitorEventPayload = {
      eventId: createEventId(),
      projectId: this.options.projectId,
      timestamp: now,
      url: window.location.href,
      sessionId: this.sessionId,
      ...enrichedInput,
    };

    this.enqueue(event);
  }

  startTimer(): void {
    this.timer = setInterval(() => this.flush(), this.options.flushInterval);
  }

  private enqueue(event: MonitorEventPayload): void {
    this.queue.push(event);
    if (this.queue.length >= this.options.batchSize) {
      this.flush();
    }
  }

  async flush(opts?: { useBeacon?: boolean }): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];
    const payload = {
      projectId: this.options.projectId,
      sessionId: this.sessionId,
      events,
    };

    if (opts?.useBeacon) {
      const success = sendByBeacon(this.options.dsn, payload);
      if (success) {
        return;
      }
    }

    try {
      await sendByFetch(this.options.dsn, payload);
    } catch {
      console.error('[Monitor] 上报失败，回退队列');
      this.queue.unshift(...events);
    }
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
  }
}