import type { PerformanceMetricItem } from '../../../styles/performance';
import {
  formatMetricTimestamp,
  formatMetricValue,
  getMetricPathname,
  getMetricUnitLabel,
  getRatingClassName,
} from './performanceOverview.utils';

interface PerformanceRecentMetricsProps {
  recentMetrics: PerformanceMetricItem[];
}

export function PerformanceRecentMetrics({
  recentMetrics,
}: PerformanceRecentMetricsProps) {
  return (
    <div className="performance-overview__recent">
      <div className="performance-overview__recent-header">
        <span>Metric</span>
        <span>Value</span>
        <span>Rating</span>
        <span>Timestamp</span>
        <span>Page</span>
        <span>Session</span>
      </div>

      {recentMetrics.map((metric) => (
        <div
          className="performance-overview__recent-row"
          key={`${metric.metricName}-${metric.timestamp}-${metric.url}`}
        >
          <span>{metric.metricName}</span>
          <span>
            {formatMetricValue(metric.value, metric.metricName === 'CLS' ? 'score' : 'ms')}
            {getMetricUnitLabel(metric.metricName)}
          </span>
          <span className={getRatingClassName(metric.rating)}>{metric.rating}</span>
          <span>{formatMetricTimestamp(metric.timestamp)}</span>
          <span className="performance-overview__recent-url">
            {getMetricPathname(metric.url)}
          </span>
          <span>{metric.sessionId || '-'}</span>
        </div>
      ))}
    </div>
  );
}
