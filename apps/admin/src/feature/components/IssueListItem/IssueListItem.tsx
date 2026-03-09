import './IssueListItem.scss';
import { Link } from 'react-router-dom';
import type { IssueItem } from '../../../styles/issue';

interface Props {
  issue: IssueItem;
}

export function IssueListItem({ issue }: Props) {
  return (
    <Link to={`/issues/${issue.id}`} className="issue-list-item">
      <div className="issue-list-item__top">
        <div className="issue-list-item__main">
          <h3 className="issue-list-item__title">{issue.title}</h3>
          <p className="issue-list-item__message">{issue.normalizedMessage}</p>
        </div>
        <span className="issue-list-item__status">{issue.status}</span>
      </div>

      <div className="issue-list-item__meta">
        <span>次数：{issue.totalCount}</span>
        <span>页面：{issue.affectedPages}</span>
        <span>用户：{issue.affectedUsers}</span>
        <span>最近：{issue.lastSeenAt}</span>
      </div>
    </Link>
  );
}
