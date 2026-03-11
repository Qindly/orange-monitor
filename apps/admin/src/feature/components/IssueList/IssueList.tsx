import './IssueList.scss';
import { IssueListItem } from '../IssueListItem/IssueListItem';
import type { IssueItem } from '../../../styles/issue';

interface Props {
  issues: IssueItem[];
}

export function IssueList({ issues }: Props) {
  if (!issues.length) {
    return <div className="issue-list__empty">当前分类下暂无异常数据</div>;
  }

  return (
    <div className="issue-list">
      {issues.map((issue) => (
        <IssueListItem key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
