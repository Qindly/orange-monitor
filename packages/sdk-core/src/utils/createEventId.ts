import { nanoid } from 'nanoid';

export function createEventId(): string {
  return nanoid();
}