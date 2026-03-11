import hash from 'object-hash';

export function hashString(input: string): string {
  return `gk_${hash(input, { algorithm: 'md5', encoding: 'hex' }).substring(0, 16)}`;
}