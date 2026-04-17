import { send, sendBeacon } from './transport';

export interface BufferedQueueConfig<T> {
  /** 批量发送阈值 */
  batchSize: number;
  /** 上报地址 */
  endpoint: string;
  /** 构建最终 payload 的工厂函数 */
  buildPayload: (items: T[]) => Record<string, unknown>;
}

/**
 * 通用的缓冲队列
 *
 * 统一 "缓冲 → 批量 → 发送 → 失败回退" 逻辑，
 * 通过 `buildPayload` 和 `endpoint` 区分不同上报类型。
 */
export class BufferedQueue<T> {
  private queue: T[] = [];

  constructor(private readonly config: BufferedQueueConfig<T>) {}

  /** 入队，满了自动 flush */
  push(item: T): void {
    this.queue.push(item);
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /** 当前队列长度 */
  get size(): number {
    return this.queue.length;
  }

  /**
   * 将队列中所有项目打包发送
   *
   * @param opts.useBeacon - 页面卸载时使用 sendBeacon 发送
   */
  async flush(opts?: { useBeacon?: boolean }): Promise<void> {
    if (this.queue.length === 0) return;

    const items = [...this.queue];
    this.queue = [];

    const payload = this.config.buildPayload(items);

    if (opts?.useBeacon) {
      const success = sendBeacon(this.config.endpoint, payload);
      if (success) return;
      // beacon 失败则 fallback 到 fetch
    }

    try {
      await send(this.config.endpoint, payload);
    } catch {
      // 发送失败，回退到队列头部以便下次重试
      this.queue.unshift(...items);
    }
  }
}