import './IssueStatsBar.scss';
import type { IssueItem } from '../../../styles/issue';

interface Props {
  issues: IssueItem[];
}

export function IssueStatsBar({ issues }: Props) {
  const totalIssues = issues.length;
  const totalCount = issues.reduce((sum, item) => sum + item.eventCount, 0);
  const totalUsers = issues.reduce((sum, item) => sum + item.affectedUsers, 0);
  const totalPages = issues.reduce((sum, item) => sum + item.affectedPages, 0);

  const stats = [
    { label: '归一异常数', value: totalIssues },
    { label: '累计触发次数', value: totalCount },
    { label: '影响用户量', value: totalUsers },
    { label: '涉及页面数', value: totalPages },
  ];

  return (
    <div className="issue-stats-bar">
      {stats.map((item) => (
        <div key={item.label} className="issue-stats-bar__card">
          <div className="issue-stats-bar__label">{item.label}</div>
          <div className="issue-stats-bar__value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
