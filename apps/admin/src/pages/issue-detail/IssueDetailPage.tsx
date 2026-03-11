import './IssueDetailPage.scss';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EventTimelineList } from '../../feature/components/EventTimelineList/EventTimelineList';
import { fetchIssues, fetchEventsByIssueId } from '../../feature/api';
import { formatTime } from '../../feature/utils';
import type { IssueItem, IssueEventItem } from '../../styles/issue';

export function IssueDetailPage() {
  const { issueId = '' } = useParams();
  const [issue, setIssue] = useState<IssueItem | null>(null);
  const [events, setEvents] = useState<IssueEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [allIssues, issueEvents] = await Promise.all([
          fetchIssues(),
          fetchEventsByIssueId(issueId),
        ]);
        if (!cancelled) {
          setIssue(allIssues.find((item) => item.id === issueId) || null);
          setEvents(issueEvents);
        }
      } catch (err) {
        console.error('拉取详情失败', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [issueId]);

  if (loading) {
    return <div className="issue-detail-page__empty">加载中...</div>;
  }

  if (!issue) {
    return <div className="issue-detail-page__empty">未找到对应异常</div>;
  }

  return (
    <div className="issue-detail-page">
      <header className="issue-detail-page__header">
        <Link to="/" className="issue-detail-page__back">返回列表</Link>
        <h1 className="issue-detail-page__title">{issue.title}</h1>
        <p className="issue-detail-page__subtitle">{issue.normalizedMessage}</p>

        <div className="issue-detail-page__meta">
          <span>异常类型：{issue.type}</span>
          <span>总次数：{issue.eventCount}</span>
          <span>影响页面：{issue.affectedPages}</span>
          <span>影响用户：{issue.affectedUsers}</span>
          <span>最近出现：{formatTime(issue.lastSeenAt)}</span>
        </div>
      </header>

      <section className="issue-detail-page__section">
        <h2 className="issue-detail-page__section-title">触发明细</h2>
        <EventTimelineList events={events} />
      </section>
    </div>
  );
}
