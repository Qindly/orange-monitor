import './EventTimelineItem.scss';
import { useState } from 'react';
import type { IssueEventItem } from '../../../styles/issue';
import { formatTime } from '../../utils';

interface Props {
  event: IssueEventItem;
}

export function EventTimelineItem({ event }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="event-timeline-item">
      <button
        type="button"
        className="event-timeline-item__summary"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="event-timeline-item__summary-main">
          <div className="event-timeline-item__message">{event.message}</div>
          <div className="event-timeline-item__meta">
            <span>用户：{event.userId || '-'}</span>
            <span>会话：{event.sessionId || '-'}</span>
            <span>页面：{event.url}</span>
            <span>时间：{formatTime(event.timestamp)}</span>
          </div>
        </div>
        <span className="event-timeline-item__toggle">
          {expanded ? '收起' : '展开'}
        </span>
      </button>

      {expanded && (
        <div className="event-timeline-item__detail">
          <div className="event-timeline-item__block">
            <div className="event-timeline-item__label">Stack</div>
            <pre className="event-timeline-item__pre">{event.rawStack || '无堆栈信息'}</pre>
          </div>

          <div className="event-timeline-item__block">
            <div className="event-timeline-item__label">Extra</div>
            <pre className="event-timeline-item__pre">
              {JSON.stringify(event.extra || {}, null, 2)}
            </pre>
          </div>

          {event.details && (
            <div className="event-timeline-item__block">
              <div className="event-timeline-item__label">Details</div>
              <pre className="event-timeline-item__pre">
                {JSON.stringify(event.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
