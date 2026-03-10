import type { StackFrame } from '../types';

export function parseStackFrames(rawStack?: string): StackFrame[] {
  if (!rawStack) return [];

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

export function getTopFrameText(frames?: StackFrame[]): string | undefined {
  const top = frames?.[0];
  if (!top) return undefined;

  const fn = top.functionName ? `${top.functionName} ` : '';
  const file = top.filename || 'unknown';
  const line = top.lineno ?? '?';
  const col = top.colno ?? '?';

  return `${fn}(${file}:${line}:${col})`;
}