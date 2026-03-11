import type { StackFrame } from '../types';
import ErrorStackParser from 'error-stack-parser';

export function parseStackFrames(rawStack?: string): StackFrame[] {
  if (!rawStack) return [];

  try {
    // 使用 error-stack-parser 解析
    const fakeError = { stack: rawStack } as Error;
    const frames = ErrorStackParser.parse(fakeError);

    return frames.map(frame => ({
      functionName: frame.functionName,
      filename: frame.fileName,
      lineno: frame.lineNumber,
      colno: frame.columnNumber,
    }));
  } catch {
    // 降级到简单的正则匹配
    return rawStack
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !/^error/i.test(line))
      .map((line) => {
        const match =
          line.match(/at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/) ||
          line.match(/at\s+(.*?):(\d+):(\d+)/);

        if (!match) {
          return {};
        }

        if (match.length === 5) {
          return {
            functionName: match[1],
            filename: match[2],
            lineno: Number(match[3]),
            colno: Number(match[4]),
          };
        }

        return {
          filename: match[1],
          lineno: Number(match[2]),
          colno: Number(match[3]),
        };
      });
  }
}

export function getTopFrameText(frames?: StackFrame[]): string | undefined {
  const top = frames?.[0];
  if (!top) return undefined;

  const fn = top.functionName ? `${top.functionName} ` : '';
  const file = top.filename || 'unknown';
  const line = top.lineno ?? '?';
  const col = top.colno ?? '?';

  return `${fn}(${file}:${line}:${col})`;
}