import './EventTimelineItem.scss';
import { useState } from 'react';
import type { IssueEventItem, IssueEventStackFrame } from '../../../styles/issue';
import { formatTime } from '../../utils';

interface Props {
  event: IssueEventItem;
}

function formatLocation(frame: IssueEventStackFrame): string {
  const file = frame.filename || 'unknown';
  const line = frame.lineno ?? '?';
  const column = frame.colno ?? '?';
  const fn = frame.functionName ? `${frame.functionName} ` : '';

  return `${fn}(${file}:${line}:${column})`;
}

function formatGeneratedLocation(frame: IssueEventStackFrame): string | null {
  if (!frame.generatedFilename || !frame.generatedLineno) {
    return null;
  }

  const line = frame.generatedLineno;
  const column = frame.generatedColno ?? '?';
  const fn = frame.generatedFunctionName ? `${frame.generatedFunctionName} ` : '';

  return `${fn}(${frame.generatedFilename}:${line}:${column})`;
}

function formatSourceContext(frame: IssueEventStackFrame): string | null {
  if (!frame.contextLine || !frame.lineno) {
    return null;
  }

  const preContext = frame.preContext || [];
  const postContext = frame.postContext || [];
  const startLine = frame.lineno - preContext.length;
  const lines = [...preContext, frame.contextLine, ...postContext];

  return lines
    .map((line, index) => {
      const currentLine = startLine + index;
      const marker = currentLine === frame.lineno ? '>' : ' ';
      return `${marker} ${String(currentLine).padStart(4, ' ')} | ${line}`;
    })
    .join('\n');
}

export function EventTimelineItem({ event }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasRestoredFrames = Boolean(event.stackFrames?.length);

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
            <span>User: {event.userId || '-'}</span>
            <span>Session: {event.sessionId || '-'}</span>
            <span>Page: {event.url}</span>
            <span>Time: {formatTime(event.timestamp)}</span>
          </div>
        </div>
        <span className="event-timeline-item__toggle">
          {expanded ? 'Collapse' : 'Expand'}
        </span>
      </button>

      {expanded && (
        <div className="event-timeline-item__detail">
          {hasRestoredFrames && (
            <div className="event-timeline-item__block">
              <div className="event-timeline-item__label">Restored Stack</div>
              <div className="event-timeline-item__frames">
                {event.stackFrames?.map((frame, index) => {
                  const generatedLocation = formatGeneratedLocation(frame);
                  const sourceContext = formatSourceContext(frame);

                  return (
                    <div
                      key={`${frame.filename || 'frame'}-${frame.lineno || index}-${frame.colno || 0}`}
                      className="event-timeline-item__frame"
                    >
                      <div className="event-timeline-item__frame-head">
                        <div className="event-timeline-item__frame-title">
                          {formatLocation(frame)}
                        </div>
                        {frame.isSymbolicated && (
                          <span className="event-timeline-item__frame-badge">symbolicated</span>
                        )}
                      </div>

                      {generatedLocation && (
                        <div className="event-timeline-item__frame-subtitle">
                          Generated: {generatedLocation}
                        </div>
                      )}

                      {sourceContext && (
                        <pre className="event-timeline-item__pre event-timeline-item__pre--compact">
                          {sourceContext}
                        </pre>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="event-timeline-item__block">
            <div className="event-timeline-item__label">Raw Stack</div>
            <pre className="event-timeline-item__pre">{event.rawStack || 'No raw stack trace.'}</pre>
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
