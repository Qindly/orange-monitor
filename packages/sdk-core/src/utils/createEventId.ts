export function createEventId(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}