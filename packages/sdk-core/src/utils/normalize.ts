import type { CaptureInput, MonitorEventPayload, MonitorEventType } from '../types';

export function normalizeMessage(message: string): string {
    return message
        // uuid
        .replace(
            /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
            '<uuid>'
        )
        // userId=123 / orderId=456 / traceId=abc
        .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*Id)=([a-zA-Z0-9_-]+)/g, '$1=<id>')
        // 时间戳 / 数字
        .replace(/\b\d{5,}\b/g, '<num>')
        // 长 hash / token
        .replace(/\b[a-f0-9]{16,}\b/gi, '<hash>')
        // url query
        .replace(/([?&][^=]+)=([^&]+)/g, '$1=<value>')
        .trim();
}

export function getStackFrames(stack?: string): string[] {
    if (!stack) return [];
    return stack
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .filter(line => !/^error/i.test(line));
}

export function getStackTopFrame(stack?: string): string {
    const frames = getStackFrames(stack);
    return frames.length > 0 ? frames[0] : "";
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
    type: MonitorEventType;
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
        .filter(item => item !== undefined && item !== '')
        .join(':');

    const fingerprintSource = [
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

export function enrichCaptureInput(input: CaptureInput): CaptureInput {
    if (input.fingerprint && input.normalizedMessage) {
        return {
            ...input,
            stackTopFrame: input.stackTopFrame || getStackTopFrame(input.stack),
        };
    }

    const built = buildFingerprint({
        type: input.type,
        message: input.normalizedMessage || input.message,
        stack: input.stack,
        filename: input.filename,
        lineno: input.lineno,
        colno: input.colno,
    });

    return {
        ...input,
        normalizedMessage: input.normalizedMessage || built.normalizedMessage,
        fingerprint: input.fingerprint || built.fingerprint,
        stackTopFrame: input.stackTopFrame || built.stackTopFrame,
    };
}

export function mergeEvents(
    prev: MonitorEventPayload,
    next: MonitorEventPayload
): MonitorEventPayload {
    return {
        ...prev,
        ...next,
        occurrenceCount: (prev.occurrenceCount ?? 1) + (next.occurrenceCount ?? 1),
        suppressedCount: (prev.suppressedCount ?? 0) + (next.suppressedCount ?? 0),
        firstSeen: prev.firstSeen ?? prev.timestamp,
        lastSeen: next.lastSeen ?? next.timestamp,
        extra: {
            ...(prev.extra || {}),
            ...(next.extra || {}),
        },
    };
}