import type {
  CaptureInput,
  MonitorEventPayload,
  MonitorEventSource,
  IssueCategory,
} from '../types';

type EnrichedCaptureInput = Omit<
  MonitorEventPayload,
  'eventId' | 'projectId' | 'timestamp' | 'url' | 'sessionId'
>;

export function getCategory(eventSource: MonitorEventSource): IssueCategory {
  switch (eventSource) {
    case 'resource_error':
      return 'resource';
    case 'http_error':
      return 'api';
    case 'js_error':
    case 'promise_error':
    case 'manual_error':
    case 'manual_message':
    default:
      return 'js';
  }
}

export function getTitle(
  type: string,
  message: string,
  eventSource: MonitorEventSource
): string {
  if (eventSource === 'manual_message') {
    return message;
  }

  return message ? `${type}: ${message}` : type;
}

export function normalizeMessage(message: string): string {
  return message
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
      '<uuid>'
    )
    .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*Id)=([a-zA-Z0-9_-]+)/g, '$1=<id>')
    .replace(/\b\d{5,}\b/g, '<num>')
    .replace(/\b[a-f0-9]{16,}\b/gi, '<hash>')
    .replace(/([?&][^=]+)=([^&]+)/g, '$1=<value>')
    .trim();
}

export function getStackFrames(stack?: string): string[] {
  if (!stack) return [];
  return stack
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^error/i.test(line));
}

export function getStackTopFrame(stack?: string): string {
  const frames = getStackFrames(stack);
  return frames[0] || '';
}

function cleanStackFrame(frame: string): string {
  return frame
    .replace(/:\d+:\d+/g, ':<line>:<col>')
    .replace(/\b\d+\b/g, '<num>')
    .trim();
}

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `fp_${Math.abs(hash)}`;
}

export function buildFingerprint(input: {
  eventSource: MonitorEventSource;
  type: string;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}): {
  normalizedMessage: string;
  stackTopFrame: string;
  fingerprint: string;
} {
  const normalizedMessage = normalizeMessage(input.message);
  const topFrame = cleanStackFrame(getStackTopFrame(input.stack));
  const location = [input.filename, input.lineno, input.colno]
    .filter((item) => item !== undefined && item !== '')
    .join(':');

  const fingerprintSource = [
    input.eventSource,
    input.type,
    normalizedMessage,
    topFrame || location || 'no_stack',
  ].join('|');

  return {
    normalizedMessage,
    stackTopFrame: topFrame,
    fingerprint: hashString(fingerprintSource),
  };
}

export function enrichCaptureInput(input: CaptureInput): EnrichedCaptureInput {
  const built = buildFingerprint({
    eventSource: input.eventSource,
    type: input.type,
    message: input.normalizedMessage || input.message,
    stack: input.stack,
    filename: input.filename,
    lineno: input.lineno,
    colno: input.colno,
  });

  return {
    ...input,
    category: input.category || getCategory(input.eventSource),
    title: input.title || getTitle(input.type, input.message, input.eventSource),
    normalizedMessage: input.normalizedMessage || built.normalizedMessage,
    fingerprint: input.fingerprint || built.fingerprint,
    stackTopFrame: input.stackTopFrame || built.stackTopFrame,
  };
}
