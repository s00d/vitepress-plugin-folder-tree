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

/** Text-like extensions safe for preview (source code, config, docs). */
const DEFAULT_PREVIEW_EXTENSIONS = [
  'ts', 'mts', 'cts', 'tsx', 'js', 'mjs', 'cjs', 'jsx',
  'vue', 'svelte', 'html', 'htm', 'css', 'scss', 'sass', 'less',
  'json', 'json5', 'jsonc', 'yaml', 'yml', 'toml', 'xml',
  'md', 'mdx', 'txt', 'csv', 'tsv',
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'kts', 'scala',
  'c', 'cpp', 'cc', 'h', 'hpp', 'cs', 'fs',
  'sh', 'bash', 'zsh', 'fish', 'bat', 'cmd', 'ps1',
  'sql', 'graphql', 'gql', 'prisma', 'proto',
  'php', 'swift', 'dart', 'lua', 'r', 'ex', 'exs', 'el',
  'ini', 'cfg', 'conf', 'env', 'properties',
  'dockerfile', 'makefile', 'tf', 'hcl',
  'gitignore', 'gitattributes', 'editorconfig',
  'prettierrc', 'eslintrc', 'babelrc',
  'diff', 'patch', 'log',
];

/** Default maximum file size for preview (in bytes). */
const DEFAULT_MAX_PREVIEW_SIZE = 4096; // 4 KB

// ─── Helpers ─────────────────────────────────────────────────────────

function simpleGlobMatch(name: string, pattern: string): boolean {
  const re = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${re}$`).test(name);
}

function getExtLower(name: string): string {
  // Handle dotfiles like .gitignore → "gitignore"
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return name.toLowerCase();
  return name.slice(dot + 1).toLowerCase();
}

function isTextExtension(ext: string, allowedExts: string[]): boolean {
  return allowedExts.includes(ext);
}

function tryReadPreview(filePath: string, maxSize: number): string | undefined {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > maxSize || stat.size === 0) return undefined;
    const content = fs.readFileSync(filePath, 'utf-8');
    // Ensure content is valid UTF-8 text (no binary junk)
    if (/[\x00-\x08\x0E-\x1F]/.test(content)) return undefined;
    return content;
  } catch {
    return undefined;
  }
}

// ─── Scan options ────────────────────────────────────────────────────

export interface ScanOptions {
  excludes: string[];
  includes: string[];
  /** Read file content into `preview` field */
  readPreview: boolean;
  /** Max file size (bytes) to read for preview */
  maxPreviewSize: number;
  /** File extensions eligible for preview */
  previewExtensions: string[];
  /** How many levels deep folders should be initially open (-1 = all) */
  openDepth: number;
}

// ─── Low-level directory scanner ─────────────────────────────────────

/**
 * Recursively scan a directory and build a `TreeNode[]` array.
 */
export function scanDirectory(
  dirPath: string,
  maxDepth: number,
  opts: ScanOptions,
  currentDepth: number = 0,
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
    if (opts.excludes.some(p => simpleGlobMatch(name, p))) continue;

    if (entry.isDirectory()) {
      const children = scanDirectory(
        nodePath.join(dirPath, name),
        maxDepth - 1,
        opts,
        currentDepth + 1,
      );
      if (opts.includes.length > 0 && children.length === 0) continue;
      const node: TreeNode = { name, isFolder: true, children };
      // Set open state based on openDepth
      if (opts.openDepth >= 0) {
        node.open = currentDepth < opts.openDepth;
      }
      result.push(node);
    } else if (entry.isFile()) {
      if (opts.includes.length > 0 && !opts.includes.some(p => simpleGlobMatch(name, p))) continue;
      const node: TreeNode = { name, isFolder: false };
      // Read preview content if enabled
      if (opts.readPreview) {
        const ext = getExtLower(name);
        if (isTextExtension(ext, opts.previewExtensions)) {
          const preview = tryReadPreview(
            nodePath.join(dirPath, name),
            opts.maxPreviewSize,
          );
          if (preview) node.preview = preview;
        }
      }
      result.push(node);
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
  /** Read file contents into `preview` (default: false) */
  preview?: boolean;
  /** Max file size in bytes for preview (default: 4096) */
  maxPreviewSize?: number;
  /** File extensions to read for preview (default: common text extensions) */
  previewExtensions?: string[];
  /** Max folder depth to auto-open (-1 = all, 0 = all closed) */
  openDepth?: number;
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

  const readPreview = config.preview === true;
  const maxPreviewSize = typeof config.maxPreviewSize === 'number' && config.maxPreviewSize > 0
    ? config.maxPreviewSize
    : DEFAULT_MAX_PREVIEW_SIZE;
  const previewExtensions = Array.isArray(config.previewExtensions)
    ? config.previewExtensions.map(String)
    : DEFAULT_PREVIEW_EXTENSIONS;
  const openDepth = typeof config.openDepth === 'number' ? config.openDepth : -1;

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

  const scanOpts: ScanOptions = {
    excludes,
    includes: userIncludes,
    readPreview,
    maxPreviewSize,
    previewExtensions,
    openDepth,
  };

  const children = scanDirectory(absolutePath, depth, scanOpts);

  let tree: TreeNode[];
  if (showRoot) {
    const dirName = rootName || nodePath.basename(absolutePath);
    const rootNode: TreeNode = { name: dirName, isFolder: true, children };
    if (openDepth >= 0) {
      rootNode.open = true; // root always open
    }
    tree = [rootNode];
  } else {
    tree = children;
  }

  if (tree.length === 0) {
    throw new Error(`No files found in: ${fromPath}`);
  }

  return tree;
}
