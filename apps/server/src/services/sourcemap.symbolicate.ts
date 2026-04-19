import { computeGroupingKey } from '../domain/grouping';
import { getTopFrameText, parseStackFrames } from '../domain/stack';
import type { NormalizedIncomingEvent, StackFrame } from '../types';
import { loadSourceMap, normalizeArtifactPath } from './sourcemap.storage';

export interface SymbolicateStackResult {
  stackFrames: StackFrame[];
  stackTopFrame?: string;
  formattedStack?: string;
  totalFrames: number;
  symbolicatedFrames: number;
  appliedArtifacts: string[];
}

function buildSourceContext(sourceContent: string | undefined, lineNumber: number | null): Pick<
  StackFrame,
  'contextLine' | 'preContext' | 'postContext'
> {
  if (!sourceContent || lineNumber == null || lineNumber < 1) {
    return {};
  }

  const lines = sourceContent.replace(/\r\n/g, '\n').split('\n');
  const index = lineNumber - 1;

  if (index >= lines.length) {
    return {};
  }

  return {
    contextLine: lines[index],
    preContext: lines.slice(Math.max(0, index - 3), index),
    postContext: lines.slice(index + 1, Math.min(lines.length, index + 4)),
  };
}

function getGeneratedColumnCandidates(frame: StackFrame): number[] {
  const rawColumn = frame.colno ?? 1;

  return Array.from(
    new Set([
      Math.max(rawColumn - 2, 0),
      Math.max(rawColumn - 1, 0),
      Math.max(rawColumn - 3, 0),
      Math.max(rawColumn - 4, 0),
      Math.max(rawColumn - 5, 0),
      Math.max(rawColumn, 0),
    ])
  );
}

function hasUsefulContextLine(frame: Pick<StackFrame, 'contextLine'>): boolean {
  if (!frame.contextLine) {
    return false;
  }

  if (/^\s*[)}\],;]+\s*$/.test(frame.contextLine)) {
    return false;
  }

  return /[A-Za-z0-9_$]/.test(frame.contextLine);
}

function formatStackFrames(frames: StackFrame[]): string | undefined {
  if (!frames.length) {
    return undefined;
  }

  return frames
    .map((frame) => {
      const file = frame.filename || 'unknown';
      const line = frame.lineno ?? '?';
      const column = frame.colno ?? '?';
      const fn = frame.functionName ? `${frame.functionName} ` : '';

      return `at ${fn}(${file}:${line}:${column})`;
    })
    .join('\n');
}

// 一条 stack frame 的核心还原动作就在这里：
// 先根据压缩文件路径找到 source map，再把 line/column 翻译回源码位置。
async function symbolicateFrame(
  projectId: string,
  release: string,
  frame: StackFrame
): Promise<StackFrame> {
  if (!frame.filename || !frame.lineno) {
    return frame;
  }

  let artifactPath: string;

  try {
    artifactPath = normalizeArtifactPath(frame.filename);
  } catch {
    return frame;
  }

  const loaded = await loadSourceMap(projectId, release, artifactPath);
  if (!loaded) {
    return frame;
  }

  let fallbackFrame: StackFrame | null = null;

  // 浏览器给的列号有时会偏到表达式右边。
  // 所以这里会向前试几个 column，优先挑到真正有意义的源码行。
  for (const generatedColumn of getGeneratedColumnCandidates(frame)) {
    const original = loaded.consumer.originalPositionFor({
      line: frame.lineno,
      column: generatedColumn,
    });

    if (!original.source || original.line == null) {
      continue;
    }

    let sourceContent: string | undefined;

    try {
      const content = loaded.consumer.sourceContentFor(original.source, true);
      sourceContent = typeof content === 'string' ? content : undefined;
    } catch {
      sourceContent = undefined;
    }

    const symbolicatedFrame: StackFrame = {
      filename: original.source,
      functionName: original.name || frame.functionName,
      lineno: original.line,
      colno: original.column != null ? original.column + 1 : undefined,
      isSymbolicated: true,
      generatedFilename: frame.filename,
      generatedFunctionName: frame.functionName,
      generatedLineno: frame.lineno,
      generatedColno: frame.colno,
      ...buildSourceContext(sourceContent, original.line),
    };

    fallbackFrame ||= symbolicatedFrame;

    if (hasUsefulContextLine(symbolicatedFrame)) {
      return symbolicatedFrame;
    }
  }

  return fallbackFrame || frame;
}

function buildFallbackFrames(event: Pick<NormalizedIncomingEvent, 'filename' | 'lineno' | 'colno'>): StackFrame[] {
  if (!event.filename || !event.lineno) {
    return [];
  }

  return [
    {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
  ];
}

// 这个函数只做一件事：把一组压缩 stack frame 还原成源码 stack frame。
export async function symbolicateStackFrames(input: {
  projectId: string;
  release: string;
  stackFrames: StackFrame[];
}): Promise<SymbolicateStackResult> {
  const symbolicatedStackFrames = await Promise.all(
    input.stackFrames.map((frame) => symbolicateFrame(input.projectId, input.release, frame))
  );

  const appliedArtifacts = Array.from(
    new Set(
      symbolicatedStackFrames
        .filter((frame) => frame.isSymbolicated && frame.generatedFilename)
        .map((frame) => normalizeArtifactPath(frame.generatedFilename as string))
    )
  );

  const symbolicatedFrames = symbolicatedStackFrames.filter((frame) => frame.isSymbolicated).length;

  return {
    stackFrames: symbolicatedStackFrames,
    stackTopFrame: getTopFrameText(symbolicatedStackFrames),
    formattedStack: formatStackFrames(symbolicatedStackFrames),
    totalFrames: input.stackFrames.length,
    symbolicatedFrames,
    appliedArtifacts,
  };
}

// stack 可能来自完整 error.stack，也可能只传了 filename/lineno。
// 这里先把两种输入统一变成 frames，后面逻辑就不用分叉了。
export function buildStackFramesForSymbolicate(input: {
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}): StackFrame[] {
  const parsedStackFrames = parseStackFrames(input.stack);

  if (parsedStackFrames.length > 0) {
    return parsedStackFrames;
  }

  if (input.filename && input.lineno) {
    return [
      {
        filename: input.filename,
        lineno: input.lineno,
        colno: input.colno,
      },
    ];
  }

  return [];
}

// 这个函数是“监控系统接线”的地方。
// 它在还原完源码位置之后，把新的 top frame 写回 event，并重新计算 groupingKey。
export async function symbolicateNormalizedEvent(
  event: NormalizedIncomingEvent,
  release?: string
): Promise<NormalizedIncomingEvent> {
  if (!release) {
    return event;
  }

  const rawFrames = event.stackFrames?.length ? event.stackFrames : buildFallbackFrames(event);

  if (!rawFrames.length) {
    return event;
  }

  const result = await symbolicateStackFrames({
    projectId: event.projectId,
    release,
    stackFrames: rawFrames,
  });

  const nextFrames = result.stackFrames.length ? result.stackFrames : event.stackFrames;
  const topFrame = nextFrames?.[0];
  const nextStackTopFrame = result.stackTopFrame || event.stackTopFrame;

  return {
    ...event,
    stackFrames: nextFrames,
    stackTopFrame: nextStackTopFrame,
    filename: topFrame?.filename || event.filename,
    lineno: topFrame?.lineno || event.lineno,
    colno: topFrame?.colno || event.colno,
    groupingKey: computeGroupingKey({
      projectId: event.projectId,
      category: event.category,
      type: event.type,
      normalizedMessage: event.normalizedMessage,
      stackTopFrame: nextStackTopFrame,
      filename: topFrame?.filename || event.filename,
      lineno: topFrame?.lineno || event.lineno,
      colno: topFrame?.colno || event.colno,
      fingerprint: event.fingerprint,
    }),
  };
}
