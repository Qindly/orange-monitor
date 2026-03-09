import './EventTimelineList.scss';
import type { IssueEventItem } from '../../../styles/issue';
import { EventTimelineItem } from '../EventTimelineItem/EventTimelineItem';

interface Props {
  events: IssueEventItem[];
}

export function EventTimelineList({ events }: Props) {
  if (!events.length) {
    return <div className="event-timeline-list__empty">暂无触发明细</div>;
  }

  return (
    <div className="event-timeline-list">
      {events.map((event) => (
        <EventTimelineItem key={event.id} event={event} />
      ))}
    </div>
  );
}
