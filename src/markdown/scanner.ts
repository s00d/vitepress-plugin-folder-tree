import * as fs from 'fs';
import * as nodePath from 'path';
import type { TreeNode } from '../config';

// ─── Constants ───────────────────────────────────────────────────────

const DEFAULT_EXCLUDES = [
  'node_modules', '.git', '.DS_Store', 'dist', '.cache',
  '.vitepress', '__pycache__', '.next', '.nuxt',
  'Thumbs.db', '.idea', '.vscode', '.hg', '.svn',
  '.turbo', '.output', 'coverage',
];

// ─── Helpers ─────────────────────────────────────────────────────────

function simpleGlobMatch(name: string, pattern: string): boolean {
  const re = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${re}$`).test(name);
}

// ─── Low-level directory scanner ─────────────────────────────────────

/**
 * Recursively scan a directory and build a `TreeNode[]` array.
 */
export function scanDirectory(
  dirPath: string,
  maxDepth: number,
  excludes: string[] = [],
  includes: string[] = [],
): TreeNode[] {
  if (maxDepth <= 0) return [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const result: TreeNode[] = [];

  for (const entry of entries) {
    const name = entry.name;
    if (excludes.some(p => simpleGlobMatch(name, p))) continue;

    if (entry.isDirectory()) {
      const children = scanDirectory(
        nodePath.join(dirPath, name),
        maxDepth - 1,
        excludes,
        includes,
      );
      if (includes.length > 0 && children.length === 0) continue;
      result.push({ name, isFolder: true, children });
    } else if (entry.isFile()) {
      if (includes.length > 0 && !includes.some(p => simpleGlobMatch(name, p))) continue;
      result.push({ name, isFolder: false });
    }
  }

  return result;
}

// ─── High-level FS config processor ──────────────────────────────────

export interface FsScanConfig {
  from: string;
  depth?: number;
  exclude?: string[];
  include?: string[];
  showRoot?: boolean;
  name?: string;
}

/**
 * Process a `from:` directive — resolve path, validate, scan, wrap.
 *
 * @throws Error with a user-friendly message on any failure.
 */
export function processFsScan(config: FsScanConfig, rootPath: string): TreeNode[] {
  const fromPath = String(config.from);
  const depth = typeof config.depth === 'number' && config.depth > 0 ? config.depth : 10;
  const userExcludes: string[] = Array.isArray(config.exclude) ? config.exclude.map(String) : [];
  const userIncludes: string[] = Array.isArray(config.include) ? config.include.map(String) : [];
  const excludes = [...DEFAULT_EXCLUDES, ...userExcludes];
  const showRoot = config.showRoot !== false;
  const rootName = typeof config.name === 'string' ? config.name : undefined;

  const absolutePath = nodePath.isAbsolute(fromPath)
    ? fromPath
    : nodePath.resolve(rootPath, fromPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Directory not found: ${fromPath}`);
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(absolutePath);
  } catch {
    throw new Error(`Cannot access: ${fromPath}`);
  }

  if (!stat.isDirectory()) {
    throw new Error(`Not a directory: ${fromPath}`);
  }

  const children = scanDirectory(absolutePath, depth, excludes, userIncludes);

  let tree: TreeNode[];
  if (showRoot) {
    const dirName = rootName || nodePath.basename(absolutePath);
    tree = [{ name: dirName, isFolder: true, children }];
  } else {
    tree = children;
  }

  if (tree.length === 0) {
    throw new Error(`No files found in: ${fromPath}`);
  }

  return tree;
}
