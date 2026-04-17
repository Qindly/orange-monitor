import './PerformancePage.scss';
import { useEffect, useState } from 'react';
import { fetchPerformanceOverview } from '../../feature/api';
import { PerformanceOverview } from '../../feature/components/PerformanceOverview/PerformanceOverview';
import type { PerformanceOverviewData } from '../../styles/performance';

export function PerformancePage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [performanceData, setPerformanceData] = useState<PerformanceOverviewData | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPerformance() {
      setPerformanceLoading(true);
      setPerformanceError(null);

      try {
        const data = await fetchPerformanceOverview(selectedProjectId);

        if (!cancelled) {
          setPerformanceData(data);
        }
      } catch (error) {
        console.error('Failed to load performance overview', error);

        if (!cancelled) {
          setPerformanceError(
            'Failed to load performance data. Make sure the collector server is running.',
          );
        }
      } finally {
        if (!cancelled) {
          setPerformanceLoading(false);
        }
      }
    }

    void loadPerformance();

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId, reloadKey]);

  return (
    <section className="performance-page">
      <header className="performance-page__header">
        <h1 className="performance-page__title">性能监控</h1>
        <p className="performance-page__subtitle">
          查看上报项目的 Web Vitals 聚合结果与最近性能记录。
        </p>
      </header>

      <PerformanceOverview
        data={performanceData}
        loading={performanceLoading}
        errorMessage={performanceError}
        onProjectChange={(projectId) => setSelectedProjectId(projectId || undefined)}
        onRefresh={() => setReloadKey((value) => value + 1)}
      />
    </section>
  );
}
