import { normalizeIncomingEvent } from '../domain/normalize';
import { toEventEntity } from '../domain/mapper';
import { getOrCreateIssue } from './issue.service';
import { insertEvent } from '../repositories/event.repository';
import type { MonitorEventPayload } from '@orange-monitor/protocol';
import { createId } from '../utils/id';
import { symbolicateNormalizedEvent } from './sourcemap.symbolicate';

export async function ingestEvents(payloads: MonitorEventPayload[]): Promise<void> {
  for (const payload of payloads) {
    const normalized = await symbolicateNormalizedEvent(
      normalizeIncomingEvent(payload),
      payload.release
    );
    const issue = await getOrCreateIssue(normalized);

    const event = toEventEntity({
      id: createId('evt'),
      issueId: issue.id,
      event: normalized,
      now: Date.now(),
    });

    await insertEvent(event);
  }
}
