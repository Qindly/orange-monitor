import type { EventEntity } from '../types';

const events: EventEntity[] = [];

export async function insertEvent(event: EventEntity): Promise<void> {
  events.push(event);
}

export async function listEventsByIssueId(issueId: string): Promise<EventEntity[]> {
  return events.filter((item) => item.issueId === issueId);
}