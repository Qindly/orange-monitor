import type { CaptureInput,  MonitorEventPayload,MonitorEventType, IssueCategory } from '../types';

type EnrichedCaptureInput = Omit<
  MonitorEventPayload,
  'eventId' | 'projectId' | 'timestamp' | 'url' | 'sessionId'
>;

export function getCategory(type: MonitorEventType): IssueCategory {
    switch (type) {
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

export function getTitle(type: MonitorEventType): string {
    switch (type) {
        case 'js_error':
            return 'JS 运行时异常';
        case 'promise_error':
            return 'Promise 异常';
        case 'resource_error':
            return '资源加载异常';
        case 'http_error':
            return 'API 请求异常';
        case 'manual_error':
            return '手动异常';
        case 'manual_message':
            return '手动消息';
        default:
            return '未知异常';
    }
}

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

export function enrichCaptureInput(input: CaptureInput):EnrichedCaptureInput{
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
        category: input.category || getCategory(input.type),
        title: input.title || getTitle(input.type),
        normalizedMessage: input.normalizedMessage || built.normalizedMessage,
        fingerprint: input.fingerprint || built.fingerprint,
        stackTopFrame: input.stackTopFrame || built.stackTopFrame,
    };
}

