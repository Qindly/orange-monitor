import './IssueDetailPage.scss';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { EventTimelineList } from '../../feature/components/EventTimelineList/EventTimelineList';
import { mockIssueEvents, mockIssues } from '../../mocks/issues';

export function IssueDetailPage() {
  const { issueId = '' } = useParams();

  const issue = useMemo(() => {
    return mockIssues.find((item) => item.id === issueId) || null;
  }, [issueId]);

  const events = useMemo(() => {
    return mockIssueEvents.filter((item) => item.issueId === issueId);
  }, [issueId]);

  if (!issue) {
    return <div className="issue-detail-page__empty">未找到对应异常</div>;
  }

  return (
    <div className="issue-detail-page">
      <header className="issue-detail-page__header">
        <h1 className="issue-detail-page__title">{issue.title}</h1>
        <p className="issue-detail-page__subtitle">{issue.normalizedMessage}</p>

        <div className="issue-detail-page__meta">
          <span>异常类型：{issue.errorType}</span>
          <span>总次数：{issue.totalCount}</span>
          <span>影响页面：{issue.affectedPages}</span>
          <span>影响用户：{issue.affectedUsers}</span>
          <span>最近出现：{issue.lastSeenAt}</span>
        </div>
      </header>

      <section className="issue-detail-page__section">
        <h2 className="issue-detail-page__section-title">触发明细</h2>
        <EventTimelineList events={events} />
      </section>
    </div>
  );
}
