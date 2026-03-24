import { promises as fs } from 'fs';
import path from 'path';
import type { RawSourceMap } from 'source-map-js';

const SOURCE_MAP_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '.data', 'sourcemaps');

function getSourceMapFilePath(projectId: string, release: string, artifactPath: string): string {
  return path.join(
    SOURCE_MAP_ROOT,
    encodeURIComponent(projectId),
    encodeURIComponent(release),
    ...artifactPath.split('/')
  ) + '.map.json';
}

export function decodeSourceMapArtifact(input: {
  minifiedFile: string;
  sourceMap?: string;
  sourceMapBase64?: string;
}): string {
  if (input.sourceMap) {
    return input.sourceMap;
  }

  if (input.sourceMapBase64) {
    return Buffer.from(input.sourceMapBase64, 'base64').toString('utf8');
  }

  throw new Error(`Missing source map content for artifact: ${input.minifiedFile}`);
}

export function parseSourceMapJson(sourceMapContent: string): RawSourceMap {
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

export async function saveSourceMap(params: {
  projectId: string;
  release: string;
  artifactPath: string;
  map: RawSourceMap;
}): Promise<void> {
  const filePath = getSourceMapFilePath(params.projectId, params.release, params.artifactPath);

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(params.map), 'utf8');
}

export async function readSourceMap(params: {
  projectId: string;
  release: string;
  artifactPath: string;
}): Promise<RawSourceMap | null> {
  const filePath = getSourceMapFilePath(params.projectId, params.release, params.artifactPath);

  try {
    const sourceMapContent = await fs.readFile(filePath, 'utf8');
    return parseSourceMapJson(sourceMapContent);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}