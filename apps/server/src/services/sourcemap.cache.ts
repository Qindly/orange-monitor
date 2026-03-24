import { SourceMapConsumer, type RawSourceMap } from 'source-map-js';

export type SourceMapConsumerInstance = InstanceType<typeof SourceMapConsumer>;

export interface LoadedSourceMap {
  consumer: SourceMapConsumerInstance;
}

const sourceMapCache = new Map<string, LoadedSourceMap>();

function buildCacheKey(projectId: string, release: string, artifactPath: string): string {
  return `${projectId}::${release}::${artifactPath}`;
}

export function buildLoadedSourceMap(map: RawSourceMap): LoadedSourceMap {
  return {
    consumer: new SourceMapConsumer(map),
  };
}

export function getCachedSourceMap(
  projectId: string,
  release: string,
  artifactPath: string
): LoadedSourceMap | null {
  return sourceMapCache.get(buildCacheKey(projectId, release, artifactPath)) ?? null;
}

export function setCachedSourceMap(
  projectId: string,
  release: string,
  artifactPath: string,
  loaded: LoadedSourceMap
): void {
  sourceMapCache.set(buildCacheKey(projectId, release, artifactPath), loaded);
}