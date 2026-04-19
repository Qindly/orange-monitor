import { formatTime } from '../../../feature/utils';
import type {
  PerformanceMetricItem,
  PerformanceRating,
} from '../../../styles/performance';

export function formatMetricValue(
  value: number,
  unit: 'ms' | 'score',
): string {
  return unit === 'score' ? value.toFixed(3) : String(Math.round(value));
}

export function getMetricUnitLabel(metricName: PerformanceMetricItem['metricName']): string {
  return metricName === 'CLS' ? '' : ' ms';
}

export function getRatingClassName(rating: PerformanceRating): string {
  return `performance-overview__rating performance-overview__rating--${rating}`;
}

export function formatMetricTimestamp(timestamp: number): string {
  return formatTime(timestamp);
}

export function getMetricPathname(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return url;
  }
}
