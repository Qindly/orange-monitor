import type {
  MonitorOptions,
  MonitorEventPayload,
  CaptureInput,
  ManualCaptureOptions,
} from './types';
import { createEventId } from './utils/createEventId';
import { sendByFetch, sendByBeacon } from './utils/transport';
import { enrichCaptureInput, mergeEvents } from './utils/normalize';
import { getSessionId, SessionDedupeStore } from './utils/session';

export class MonitorClient {
  private queue: MonitorEventPayload[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private options: Required<Omit<MonitorOptions, 'Handlers'>>;
  private sessionId: string;
  private sessionDedupeStore = new SessionDedupeStore();

  constructor(options: MonitorOptions) {
    this.options = {
      batchSize: 3,
      flushInterval: 5000,
      dedupeWindow: 10000,
      dedupeBySession: true,
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
      occurrenceCount: 1,
      suppressedCount: 0,
      firstSeen: now,
      lastSeen: now,
      ...enrichedInput,
    };

    this.enqueue(event);
  }

  startTimer(): void {
    this.timer = setInterval(() => this.flush(), this.options.flushInterval);
  }

  private enqueue(event: MonitorEventPayload): void {
    if (this.options.dedupeBySession && event.fingerprint) {
      const existing = this.queue.find(item => item.fingerprint === event.fingerprint);

      if (existing) {
        existing.occurrenceCount = (existing.occurrenceCount ?? 1) + 1;
        existing.lastSeen = event.timestamp;
        return;
      }

      if (this.sessionDedupeStore.has(event.fingerprint)) {
        return;
      }

      this.sessionDedupeStore.add(event.fingerprint);
    }

    const sameIndex = this.queue.findIndex(
      item => item.fingerprint === event.fingerprint
    );

    if (sameIndex >= 0) {
      this.queue[sameIndex] = mergeEvents(this.queue[sameIndex], event);
    } else {
      this.queue.push(event);
    }

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
      if (success) return;
    }

    try {
      await sendByFetch(this.options.dsn, payload);
    } catch {
      console.error('[Monitor] 上报失败，回退队列');
      this.queue.unshift(...events);
    }
  }

  captureException(error: unknown, options?: ManualCaptureOptions): void {
    let message = 'Unknown error';
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      try {
        message = JSON.stringify(error);
      } catch {
        message = String(error);
      }
    }

    this.capture({
      type: 'manual_error',
      message,
      stack,
      extra: options?.extra,
      normalizedMessage: options?.normalizedMessage,
      fingerprint: options?.fingerprint,
    });
  }

  captureMessage(message: string, options?: ManualCaptureOptions): void {
    this.capture({
      type: 'manual_message',
      message,
      extra: options?.extra,
      normalizedMessage: options?.normalizedMessage,
      fingerprint: options?.fingerprint,
    });
  }

  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}