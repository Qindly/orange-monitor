import type { MonitorOptions, MonitorEventPayload, CaptureInput } from './types';
import { createEventId } from './utils/createEventId';
import { sendByFetch, sendByBeacon } from './utils/transport';

export class MonitorClient {
  private queue: MonitorEventPayload[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private options: Required<Omit<MonitorOptions, 'integrations'>>;

  constructor(options: MonitorOptions) {
    this.options = {
      batchSize: 3,
      flushInterval: 5000,
      ...options,
    };
  }

  // 唯一公开入口：补全通用字段，其余字段由 integration 提供
  capture(input: CaptureInput): void {
    const event: MonitorEventPayload = {
      eventId: createEventId(),
      projectId: this.options.projectId,
      timestamp: Date.now(),
      url: window.location.href,
      ...input,
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

  flush(opts?: { useBeacon?: boolean }): void {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];
    const payload = { projectId: this.options.projectId, events };

    if (opts?.useBeacon) {
      sendByBeacon(this.options.dsn, payload);
      return;
    }

    sendByFetch(this.options.dsn, payload, () => {
      // 失败回退：重新放回队列头部
      this.queue.unshift(...events);
    });
  }

  captureException(error: unknown, extra?: Record<string, unknown>): void {
    let message = 'Unknown error';
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      try { message = JSON.stringify(error); } catch { message = String(error); }
    }

    this.capture({ type: 'manual_error', message, stack, extra });
  }

  captureMessage(message: string, extra?: Record<string, unknown>): void {
    this.capture({ type: 'manual_message', message, extra });
  }

  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}