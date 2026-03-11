export function extractPath(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return parsed.pathname || '/';
  } catch {
    return undefined;
  }
}

export function buildPageKey(url: string, path?: string): string | undefined {
  if (path) return path;
  return extractPath(url);
}