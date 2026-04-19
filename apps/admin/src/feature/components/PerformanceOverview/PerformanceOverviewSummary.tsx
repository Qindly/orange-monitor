import { formatTime } from '../../../feature/utils';
import type { PerformanceOverviewData } from '../../../styles/performance';

interface PerformanceOverviewSummaryProps {
  data: PerformanceOverviewData;
}

export function PerformanceOverviewSummary({
  data,
}: PerformanceOverviewSummaryProps) {
  return (
    <div className="performance-overview__summary">
      <div className="performance-overview__summary-card">
        <div className="performance-overview__summary-label">Project</div>
        <div className="performance-overview__summary-value">{data.selectedProjectId}</div>
        <div className="performance-overview__summary-hint">
          Viewing the latest aggregated metrics for this project.
        </div>
      </div>

      <div className="performance-overview__summary-card">
        <div className="performance-overview__summary-label">Metric Events</div>
        <div className="performance-overview__summary-value">{data.totals.metricCount}</div>
        <div className="performance-overview__summary-hint">
          Total performance samples buffered on the server.
        </div>
      </div>

      <div className="performance-overview__summary-card">
        <div className="performance-overview__summary-label">Sessions</div>
        <div className="performance-overview__summary-value">{data.totals.sessionCount}</div>
        <div className="performance-overview__summary-hint">
          Distinct sessions in the current in-memory window.
        </div>
      </div>

      <div className="performance-overview__summary-card">
        <div className="performance-overview__summary-label">Last Report</div>
        <div className="performance-overview__summary-value">
          {data.totals.lastReportedAt ? formatTime(data.totals.lastReportedAt) : '-'}
        </div>
        <div className="performance-overview__summary-hint">
          Distinct pages: {data.totals.pageCount}
        </div>
      </div>
    </div>
  );
}
