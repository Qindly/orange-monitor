import './IssueCenterPage.scss';
import { useMemo, useState } from 'react';
import { IssueCategorySidebar } from '../../feature/components/IssueCategorySidebar/IssueCategorySidebar';
import { IssueList } from '../../feature/components/IssueList/IssueList';
import { IssueStatsBar } from '../../feature/components/IssueStatsBar/IssueStatsBar';
import { ISSUE_CATEGORIES } from '../../feature/constants';
import { mockIssues } from '../../mocks/issues';
import type { IssueCategory } from '../../styles/issue';

export function IssueCenterPage() {
  const [activeCategory, setActiveCategory] = useState<IssueCategory>('js');

  const currentCategory = ISSUE_CATEGORIES.find(
    (item) => item.key === activeCategory
  );

  const currentIssues = useMemo(() => {
    return mockIssues.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

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

          <IssueStatsBar issues={currentIssues} />

          <IssueList issues={currentIssues} />
        </main>
      </div>
    </div>
  );
}
