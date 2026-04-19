import './PerformanceOverview.scss';
import { PerformanceMetricGrid } from './PerformanceMetricGrid';
import { PerformanceOverviewSummary } from './PerformanceOverviewSummary';
import { PerformanceRecentMetrics } from './PerformanceRecentMetrics';
import type { PerformanceOverviewData } from '../../../styles/performance';

interface PerformanceOverviewProps {
  data: PerformanceOverviewData | null;
  loading: boolean;
  errorMessage: string | null;
  onProjectChange: (projectId: string) => void;
  onRefresh: () => void;
}

function renderState(message: string) {
  return <div className="performance-overview__state">{message}</div>;
}

export function PerformanceOverview({
  data,
  loading,
  errorMessage,
  onProjectChange,
  onRefresh,
}: PerformanceOverviewProps) {
  const selectedProjectId = data?.selectedProjectId ?? '';

  return (
    <section className="performance-overview">
      <div className="performance-overview__header">
        <div>
          <h2 className="performance-overview__title">Performance Overview</h2>
          <p className="performance-overview__subtitle">
            This panel shows the performance data reported by monitored projects.
            Open `react-demo`, refresh once, trigger a slow interaction, then
            come back here to inspect the aggregated results.
          </p>
        </div>

        <div className="performance-overview__controls">
          <select
            className="performance-overview__select"
            disabled={loading || !data?.projectIds.length}
            value={selectedProjectId}
            onChange={(event) => onProjectChange(event.target.value)}
          >
            {data?.projectIds.length ? (
              data.projectIds.map((projectId) => (
                <option key={projectId} value={projectId}>
                  {projectId}
                </option>
              ))
            ) : (
              <option value="">No project</option>
            )}
          </select>

          <button className="performance-overview__button" onClick={onRefresh}>
            Refresh
          </button>
        </div>
      </div>

      {loading
        ? renderState('Loading performance data...')
        : errorMessage
          ? renderState(errorMessage)
          : !data || !data.selectedProjectId
            ? renderState(
                'No performance data yet. Open `react-demo`, refresh the page, and interact once to generate web-vitals.',
              )
            : (
              <>
                <PerformanceOverviewSummary data={data} />
                <PerformanceMetricGrid metrics={data.metrics} />
                <PerformanceRecentMetrics recentMetrics={data.recentMetrics} />
              </>
            )}
    </section>
  );
}
