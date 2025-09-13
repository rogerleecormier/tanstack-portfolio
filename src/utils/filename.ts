export const SAFE_MD_NAME = /^[a-zA-Z0-9-_]{3,64}\.md$/;

export type AllowedDir = 'blog' | 'portfolio' | 'projects';

export function isAllowedDir(dir: string): dir is AllowedDir {
  return dir === 'blog' || dir === 'portfolio' || dir === 'projects';
}

export function isSafeMarkdownFileName(name: string): boolean {
  return SAFE_MD_NAME.test(name);
}

export function buildKey(dir: AllowedDir, baseName: string): string | null {
  // baseName can be with or without .md
  const clean = baseName.endsWith('.md') ? baseName : `${baseName}.md`;
  if (!isAllowedDir(dir)) return null;
  if (!isSafeMarkdownFileName(clean)) return null;
  return `${dir}/${clean}`;
}
