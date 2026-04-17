import type {
  PerformanceMetricName,
  PerformanceMetricPayload,
  PerformanceRating,
} from '@orange-monitor/protocol';

export interface PerformanceMetricSummary {
  metricName: PerformanceMetricName;
  unit: 'ms' | 'score';
  count: number;
  latestValue: number;
  latestRating: PerformanceRating;
  averageValue: number;
  p75Value: number;
  goodCount: number;
  needsImprovementCount: number;
  poorCount: number;
}

export interface PerformanceOverviewData {
  projectIds: string[];
  selectedProjectId: string | null;
  totals: {
    metricCount: number;
    sessionCount: number;
    pageCount: number;
    lastReportedAt: number | null;
  };
  metrics: PerformanceMetricSummary[];
  recentMetrics: PerformanceMetricPayload[];
}

const METRIC_ORDER: PerformanceMetricName[] = [
  'FCP',
  'LCP',
  'CLS',
  'TTFB',
  'INP',
  'DOMReady',
  'Load',
  'FP',
];

const MAX_METRICS_PER_PROJECT = 240;
const performanceStore = new Map<string, PerformanceMetricPayload[]>();

function getMetricUnit(metricName: PerformanceMetricName): 'ms' | 'score' {
  return metricName === 'CLS' ? 'score' : 'ms';
}

function roundMetricValue(value: number, unit: 'ms' | 'score'): number {
  return unit === 'score' ? Number(value.toFixed(3)) : Math.round(value);
}

function getPercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;

  const sortedValues = [...values].sort((left, right) => left - right);
  const index = Math.max(
    0,
    Math.ceil((percentile / 100) * sortedValues.length) - 1,
  );

  return sortedValues[Math.min(sortedValues.length - 1, index)];
}

function getPathname(url: string): string {
  try {
    return new URL(url).pathname || '/';
  } catch {
    return url;
  }
}

function buildMetricSummary(
  metricName: PerformanceMetricName,
  metrics: PerformanceMetricPayload[],
): PerformanceMetricSummary | null {
  if (metrics.length === 0) return null;

  const unit = getMetricUnit(metricName);
  const values = metrics.map((metric) => metric.value);
  const latestMetric = [...metrics].sort(
    (left, right) => right.timestamp - left.timestamp,
  )[0];

  const ratingCounts: Record<PerformanceRating, number> = {
    good: 0,
    'needs-improvement': 0,
    poor: 0,
  };

  for (const metric of metrics) {
    ratingCounts[metric.rating] += 1;
  }

  const averageValue =
    values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    metricName,
    unit,
    count: metrics.length,
    latestValue: roundMetricValue(latestMetric.value, unit),
    latestRating: latestMetric.rating,
    averageValue: roundMetricValue(averageValue, unit),
    p75Value: roundMetricValue(getPercentile(values, 75), unit),
    goodCount: ratingCounts.good,
    needsImprovementCount: ratingCounts['needs-improvement'],
    poorCount: ratingCounts.poor,
  };
}

export function recordPerformanceMetrics(
  projectId: string,
  metrics: PerformanceMetricPayload[],
): void {
  const currentMetrics = performanceStore.get(projectId) ?? [];

  currentMetrics.push(
    ...metrics.map((metric) => ({
      ...metric,
      projectId,
    })),
  );

  if (currentMetrics.length > MAX_METRICS_PER_PROJECT) {
    currentMetrics.splice(0, currentMetrics.length - MAX_METRICS_PER_PROJECT);
  }

  performanceStore.set(projectId, currentMetrics);
}

export function getPerformanceOverview(
  requestedProjectId?: string,
): PerformanceOverviewData {
  const projectIds = [...performanceStore.keys()].sort((left, right) =>
    left.localeCompare(right),
  );

  const selectedProjectId =
    requestedProjectId && performanceStore.has(requestedProjectId)
      ? requestedProjectId
      : projectIds[0] ?? null;

  if (!selectedProjectId) {
    return {
      projectIds,
      selectedProjectId: null,
      totals: {
        metricCount: 0,
        sessionCount: 0,
        pageCount: 0,
        lastReportedAt: null,
      },
      metrics: [],
      recentMetrics: [],
    };
  }

  const metrics = performanceStore.get(selectedProjectId) ?? [];
  const sessionIds = new Set(
    metrics
      .map((metric) => metric.sessionId)
      .filter((sessionId): sessionId is string => Boolean(sessionId)),
  );
  const pageKeys = new Set(metrics.map((metric) => getPathname(metric.url)));
  const lastReportedAt =
    metrics.length > 0
      ? Math.max(...metrics.map((metric) => metric.timestamp))
      : null;

  const metricSummaries = METRIC_ORDER.map((metricName) =>
    buildMetricSummary(
      metricName,
      metrics.filter((metric) => metric.metricName === metricName),
    ),
  ).filter(
    (summary): summary is PerformanceMetricSummary => summary !== null,
  );

  const recentMetrics = [...metrics]
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, 12);

  return {
    projectIds,
    selectedProjectId,
    totals: {
      metricCount: metrics.length,
      sessionCount: sessionIds.size,
      pageCount: pageKeys.size,
      lastReportedAt,
    },
    metrics: metricSummaries,
    recentMetrics,
  };
}
