import { promises as fs } from 'fs';
import path from 'path';
import { SourceMapConsumer, type RawSourceMap } from 'source-map-js';

type SourceMapConsumerInstance = InstanceType<typeof SourceMapConsumer>;

interface CachedSourceMap {
  consumer: SourceMapConsumerInstance;
}

export interface UploadSourceMapArtifact {
  minifiedFile: string;
  sourceMap?: string;
  sourceMapBase64?: string;
}

export interface UploadSourceMapResult {
  minifiedFile: string;
  normalizedMinifiedFile: string;
  sourceCount: number;
  hasSourcesContent: boolean;
}

const SOURCE_MAP_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '.data', 'sourcemaps');
const sourceMapCache = new Map<string, CachedSourceMap>();

function buildCacheKey(projectId: string, release: string, artifactPath: string): string {
  return `${projectId}::${release}::${artifactPath}`;
}

function getSourceMapFilePath(projectId: string, release: string, artifactPath: string): string {
  return path.join(
    SOURCE_MAP_ROOT,
    encodeURIComponent(projectId),
    encodeURIComponent(release),
    ...artifactPath.split('/')
  ) + '.map.json';
}

// 浏览器 stack 里拿到的文件名可能是完整 URL，也可能带 query/hash。
// 这里先把它整理成统一的 artifacts 路径，这样上传和查询才能对得上。
export function normalizeArtifactPath(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Artifact path is required');
  }

  let artifactPath = trimmed.replace(/\\/g, '/');

  try {
    const url = new URL(artifactPath);
    artifactPath = url.pathname;
  } catch {}

  artifactPath = artifactPath.split('#', 1)[0]?.split('?', 1)[0] || '';
  artifactPath = artifactPath.replace(/^\/+/, '');
  artifactPath = path.posix.normalize(artifactPath);

  if (
    !artifactPath ||
    artifactPath === '.' ||
    artifactPath.startsWith('../') ||
    artifactPath.includes('/../') ||
    path.posix.isAbsolute(artifactPath)
  ) {
    throw new Error(`Invalid artifact path: ${input}`);
  }

  return artifactPath;
}

function decodeSourceMapArtifact(artifact: UploadSourceMapArtifact): string {
  if (artifact.sourceMap) {
    return artifact.sourceMap;
  }

  if (artifact.sourceMapBase64) {
    return Buffer.from(artifact.sourceMapBase64, 'base64').toString('utf8');
  }

  throw new Error(`Missing source map content for artifact: ${artifact.minifiedFile}`);
}

function parseSourceMapJson(sourceMapContent: string): RawSourceMap {
  let parsed: unknown;

  try {
    parsed = JSON.parse(sourceMapContent);
  } catch {
    throw new Error('Source map must be valid JSON');
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Source map JSON must be an object');
  }

  const candidate = parsed as Partial<RawSourceMap>;

  if (typeof candidate.version !== 'number') {
    throw new Error('Source map is missing version');
  }

  if (typeof candidate.mappings !== 'string') {
    throw new Error('Source map is missing mappings');
  }

  if (!Array.isArray(candidate.sources)) {
    throw new Error('Source map is missing sources');
  }

  return candidate as RawSourceMap;
}

function buildCachedSourceMap(map: RawSourceMap): CachedSourceMap {
  return {
    consumer: new SourceMapConsumer(map),
  };
}

// 上传接口会先把 map 保存到磁盘，再顺手放进内存缓存。
// 这样下一次解析同一个 release 的报错时，不用再重复读文件。
export async function uploadSourceMaps(input: {
  projectId: string;
  release: string;
  artifacts: UploadSourceMapArtifact[];
}): Promise<UploadSourceMapResult[]> {
  return Promise.all(
    input.artifacts.map(async (artifact) => {
      const normalizedMinifiedFile = normalizeArtifactPath(artifact.minifiedFile);
      const parsedSourceMap = parseSourceMapJson(decodeSourceMapArtifact(artifact));
      const filePath = getSourceMapFilePath(input.projectId, input.release, normalizedMinifiedFile);
      const cacheKey = buildCacheKey(input.projectId, input.release, normalizedMinifiedFile);

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(parsedSourceMap), 'utf8');
      sourceMapCache.set(cacheKey, buildCachedSourceMap(parsedSourceMap));

      return {
        minifiedFile: artifact.minifiedFile,
        normalizedMinifiedFile,
        sourceCount: parsedSourceMap.sources.length,
        hasSourcesContent:
          Array.isArray(parsedSourceMap.sourcesContent) &&
          parsedSourceMap.sourcesContent.some((item) => typeof item === 'string' && item.length > 0),
      };
    })
  );
}

// 解析 stack 时会频繁查 map。
// 这里先查内存缓存，没命中再回磁盘读取，避免每一帧都重复 IO。
export async function loadSourceMap(
  projectId: string,
  release: string,
  artifactPath: string
): Promise<CachedSourceMap | null> {
  const cacheKey = buildCacheKey(projectId, release, artifactPath);
  const cached = sourceMapCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const filePath = getSourceMapFilePath(projectId, release, artifactPath);

  try {
    const sourceMapContent = await fs.readFile(filePath, 'utf8');
    const parsed = parseSourceMapJson(sourceMapContent);
    const loaded = buildCachedSourceMap(parsed);
    sourceMapCache.set(cacheKey, loaded);
    return loaded;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}
