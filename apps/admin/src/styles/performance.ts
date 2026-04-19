export type PerformanceMetricName =
  | 'FP'
  | 'FCP'
  | 'LCP'
  | 'CLS'
  | 'TTFB'
  | 'INP'
  | 'DOMReady'
  | 'Load';

export type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

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

export interface PerformanceMetricItem {
  projectId: string;
  sessionId?: string;
  url: string;
  timestamp: number;
  metricName: PerformanceMetricName;
  value: number;
  rating: PerformanceRating;
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
  recentMetrics: PerformanceMetricItem[];
}

export interface GetPerformanceOverviewResponse {
  success: boolean;
  data: PerformanceOverviewData;
}
