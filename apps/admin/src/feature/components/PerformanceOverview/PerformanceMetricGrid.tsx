import type { PerformanceMetricSummary } from '../../../styles/performance';
import {
  formatMetricValue,
  getRatingClassName,
} from './performanceOverview.utils';

interface PerformanceMetricGridProps {
  metrics: PerformanceMetricSummary[];
}

export function PerformanceMetricGrid({
  metrics,
}: PerformanceMetricGridProps) {
  return (
    <div className="performance-overview__metric-grid">
      {metrics.map((metric) => (
        <article className="performance-overview__metric-card" key={metric.metricName}>
          <div className="performance-overview__metric-top">
            <div className="performance-overview__metric-name">{metric.metricName}</div>
            <span className={getRatingClassName(metric.latestRating)}>
              {metric.latestRating}
            </span>
          </div>

          <div className="performance-overview__metric-value">
            {formatMetricValue(metric.latestValue, metric.unit)}
            <span className="performance-overview__metric-unit">
              {metric.unit === 'score' ? '' : 'ms'}
            </span>
          </div>

          <div className="performance-overview__metric-meta">
            <span>P75: {formatMetricValue(metric.p75Value, metric.unit)}</span>
            <span>Avg: {formatMetricValue(metric.averageValue, metric.unit)}</span>
            <span>Good: {metric.goodCount}</span>
            <span>Poor: {metric.poorCount}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
