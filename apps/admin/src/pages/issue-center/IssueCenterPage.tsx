import './IssueCenterPage.scss';
import { useEffect, useMemo, useState } from 'react';
import { IssueCategorySidebar } from '../../feature/components/IssueCategorySidebar/IssueCategorySidebar';
import { IssueList } from '../../feature/components/IssueList/IssueList';
import { IssueStatsBar } from '../../feature/components/IssueStatsBar/IssueStatsBar';
import { ISSUE_CATEGORIES } from '../../feature/constants';
import { fetchIssues } from '../../feature/api';
import type { IssueCategory, IssueItem } from '../../styles/issue';

export function IssueCenterPage() {
  const [activeCategory, setActiveCategory] = useState<IssueCategory>('js');
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchIssues();
        if (!cancelled) setIssues(data);
      } catch (err) {
        console.error('拉取 issues 失败', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const currentCategory = ISSUE_CATEGORIES.find(
    (item) => item.key === activeCategory
  );

  const currentIssues = useMemo(() => {
    return issues.filter((item) => item.category === activeCategory);
  }, [issues, activeCategory]);

  return (
    <div className="issue-center-page">
      <div className="issue-center-page__layout">
        <aside className="issue-center-page__sidebar">
          <IssueCategorySidebar
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />
        </aside>

        <main className="issue-center-page__content">
          <header className="issue-center-page__header">
            <h1 className="issue-center-page__title">
              {currentCategory?.label || '异常中心'}
            </h1>
            <p className="issue-center-page__subtitle">
              {currentCategory?.description || '按归一结果展示异常，并统计次数、页面与用户影响范围'}
            </p>
          </header>

          {loading ? (
            <div className="issue-center-page__loading">加载中...</div>
          ) : (
            <>
              <IssueStatsBar issues={currentIssues} />
              <IssueList issues={currentIssues} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
