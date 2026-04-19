import { onFCP, onLCP, onCLS, onTTFB, onINP } from 'web-vitals';
import type { Handler, MonitorClient, PerformanceRating } from '../types';

/**
 * 性能监控 Handler（基于 web-vitals）
 *
 * 自动采集 Web 核心性能指标：
 * - FCP（First Contentful Paint）
 * - LCP（Largest Contentful Paint）
 * - CLS（Cumulative Layout Shift）
 * - TTFB（Time to First Byte）
 * - INP（Interaction to Next Paint）
 *
 * 评级阈值、终止时机、session window 等边界情况
 * 均由 google/web-vitals 库标准实现。
 *
 * @example
 * ```ts
 * import { initMonitor, performanceHandler } from '@orange-monitor/sdk-core';
 *
 * initMonitor({
 *   dsn: 'http://localhost:3000/ingest',
 *   projectId: 'my-project',
 *   Handlers: [
 *     performanceHandler(),
 *   ],
 * });
 * ```
 */
export const performanceHandler = (): Handler => ({
  name: 'Performance',
  setup(client: MonitorClient) {
    onFCP(({ value, rating }) => {
      client.capturePerformance({ metricName: 'FCP', value, rating: rating as PerformanceRating });
    });

    onLCP(({ value, rating }) => {
      client.capturePerformance({ metricName: 'LCP', value, rating: rating as PerformanceRating });
    });

    onCLS(({ value, rating }) => {
      client.capturePerformance({ metricName: 'CLS', value, rating: rating as PerformanceRating });
    });

    onTTFB(({ value, rating }) => {
      client.capturePerformance({ metricName: 'TTFB', value, rating: rating as PerformanceRating });
    });

    onINP(({ value, rating }) => {
      client.capturePerformance({ metricName: 'INP', value, rating: rating as PerformanceRating });
    });
  },
});