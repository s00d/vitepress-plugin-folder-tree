import YAML from 'yaml';
import * as fs from 'fs';
import * as nodePath from 'path';
import type { PluginConfig, TreeNode, YamlInputItem, YamlInputObject } from './config';

// ── Validation ──────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const KNOWN_KEYS = new Set([
  'name', 'type', 'children', 'description', 'note',
  'highlight', 'icon', 'open', 'locked', 'href',
  'status', 'preview', 'tab',
]);

const KNOWN_OPTIONS = new Set(['defaultOpen', 'showToolbar', 'showBadges', 'interactive']);

const VALID_STATUSES = new Set(['added', 'removed', 'deleted', 'modified']);

/**
 * Validate a raw YAML string before full parsing.
 */
export function validateTreeInput(raw: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const trimmed = raw.trim();
  if (!trimmed) {
    errors.push('Tree is empty — add at least one item.');
    return { valid: false, errors, warnings };
  }

  let parsed: unknown;
  try {
    parsed = YAML.parse(trimmed);
  } catch (e: any) {
    errors.push(`YAML syntax error: ${e.message ?? 'unknown'}`);
    return { valid: false, errors, warnings };
  }

  // Support object format: { options: {...}, tree: [...] }
  let items: unknown;
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.tree)) {
      // Validate options
      if (obj.options !== undefined) {
        if (typeof obj.options !== 'object' || obj.options === null || Array.isArray(obj.options)) {
          warnings.push('"options" should be an object with boolean values.');
        } else {
          for (const [k, v] of Object.entries(obj.options as Record<string, unknown>)) {
            if (!KNOWN_OPTIONS.has(k)) {
              warnings.push(`options: unknown key "${k}" — known options: ${[...KNOWN_OPTIONS].join(', ')}.`);
            }
            if (typeof v !== 'boolean') {
              warnings.push(`options.${k}: should be true/false.`);
            }
          }
        }
      }
      items = obj.tree;
    } else {
      errors.push('Root must be a YAML array (start lines with "- ") or an object with "tree" array.');
      return { valid: false, errors, warnings };
    }
  } else {
    items = parsed;
  }

  if (!Array.isArray(items)) {
    errors.push('Root must be a YAML array (start lines with "- ") or an object with "tree" array.');
    return { valid: false, errors, warnings };
  }

  if ((items as unknown[]).length === 0) {
    errors.push('Tree is empty — add at least one item.');
    return { valid: false, errors, warnings };
  }

  const validateItems = (itemsList: unknown[], path: string) => {
    for (let i = 0; i < itemsList.length; i++) {
      const item = itemsList[i];
      const loc = `${path}[${i}]`;

      if (typeof item === 'string') {
        if (!item.trim()) errors.push(`${loc}: empty string — every item needs a name.`);
        continue;
      }

      if (item === null || item === undefined) {
        errors.push(`${loc}: null/empty item.`);
        continue;
      }

      if (typeof item !== 'object' || Array.isArray(item)) {
        errors.push(`${loc}: must be a string or an object with "name".`);
        continue;
      }

      const obj = item as Record<string, unknown>;

      // Allow name OR tab
      const hasName = obj.name && typeof obj.name === 'string' && (obj.name as string).trim();
      const hasTab = obj.tab && typeof obj.tab === 'string' && (obj.tab as string).trim();

      if (!hasName && !hasTab) {
        errors.push(`${loc}: missing or empty "name" field.`);
        continue;
      }

      if (obj.type !== undefined && obj.type !== 'file' && obj.type !== 'folder') {
        errors.push(`${loc} ("${obj.name || obj.tab}"): "type" must be "file" or "folder", got "${obj.type}".`);
      }

      if (obj.children !== undefined) {
        if (!Array.isArray(obj.children)) {
          errors.push(`${loc} ("${obj.name || obj.tab}"): "children" must be an array.`);
        } else {
          if (obj.type === 'file') {
            warnings.push(`${loc} ("${obj.name || obj.tab}"): type is "file" but has "children" — will be treated as folder.`);
          }
          validateItems(obj.children, `${loc}.children`);
        }
      }

      // boolean checks
      for (const boolField of ['open', 'highlight', 'locked'] as const) {
        if (obj[boolField] !== undefined && typeof obj[boolField] !== 'boolean') {
          warnings.push(`${loc} ("${obj.name || obj.tab}"): "${boolField}" should be true/false.`);
        }
      }

      // string checks
      for (const strField of ['description', 'note', 'icon', 'href', 'preview', 'tab'] as const) {
        if (obj[strField] !== undefined && typeof obj[strField] !== 'string') {
          warnings.push(`${loc} ("${obj.name || obj.tab}"): "${strField}" should be a string.`);
        }
      }

      // status check (enum)
      if (obj.status !== undefined) {
        if (typeof obj.status !== 'string' || !VALID_STATUSES.has(obj.status)) {
          warnings.push(`${loc} ("${obj.name || obj.tab}"): "status" should be "added", "removed", "deleted", or "modified".`);
        }
      }

      for (const key of Object.keys(obj)) {
        if (!KNOWN_KEYS.has(key)) {
          warnings.push(`${loc} ("${obj.name || obj.tab}"): unknown key "${key}" — will be ignored.`);
        }
      }
    }
  };

  validateItems(items as unknown[], 'root');

  return { valid: errors.length === 0, errors, warnings };
}

// ── YAML → TreeNode[] parser ────────────────────────────────────────

export interface ParsedTreeData {
  tree: TreeNode[];
  options: Record<string, boolean>;
}

/**
 * Parse YAML content.
 * Supports two formats:
 * 1. Root is an array → plain tree, no per-block options
 * 2. Root is an object with `tree` (array) and optional `options` → per-block options
 */
export function parseTree(raw: string): ParsedTreeData {
  const parsed = YAML.parse(raw.trim());

  // Format 2: object with `tree` key
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.tree)) {
    const options: Record<string, boolean> = {};
    if (parsed.options && typeof parsed.options === 'object') {
      for (const [k, v] of Object.entries(parsed.options)) {
        if (typeof v === 'boolean') options[k] = v;
      }
    }
    return { tree: convertItems(parsed.tree), options };
  }

  // Format 1: plain array
  if (!Array.isArray(parsed)) return { tree: [], options: {} };
  return { tree: convertItems(parsed), options: {} };
}

function convertItems(items: YamlInputItem[]): TreeNode[] {
  const result: TreeNode[] = [];

  for (const item of items) {
    if (item === null || item === undefined) continue;

    if (typeof item === 'string') {
      const name = item.trim();
      if (!name) continue;
      result.push({ name, isFolder: false });
      continue;
    }

    const obj = item as YamlInputObject;
    const name = obj.name || obj.tab || '';
    if (!name) continue;

    const hasChildren = Array.isArray(obj.children) && obj.children.length > 0;
    const isFolder = obj.type === 'folder' || hasChildren;

    const node: TreeNode = { name, isFolder };

    if (isFolder) {
      node.children = hasChildren ? convertItems(obj.children!) : [];
    }

    if (obj.description) node.description = obj.description;
    if (obj.note) node.note = obj.note;
    if (obj.highlight) node.highlight = true;
    if (obj.icon) node.icon = obj.icon;
    if (obj.open !== undefined) node.open = obj.open;
    if (obj.locked) node.locked = true;
    if (obj.href) node.href = obj.href;
    if (obj.status) node.status = obj.status === 'deleted' ? 'removed' : obj.status;
    if (obj.preview) node.preview = obj.preview;
    if (obj.tab) node.tab = obj.tab;

    result.push(node);
  }

  return result;
}

// ── ASCII tree parser ───────────────────────────────────────────────

/**
 * Detect if text looks like an ASCII tree (├── └── │ characters).
 */
export function isAsciiTree(text: string): boolean {
  const trimmed = text.trim();
  // If it starts with YAML patterns, it's not ASCII
  const firstLine = trimmed.split('\n')[0]?.trim() || '';
  if (
    firstLine.startsWith('- ') ||
    firstLine.startsWith('options:') ||
    firstLine.startsWith('tree:') ||
    firstLine.startsWith('url:') ||
    firstLine.startsWith('name:')
  ) {
    return false;
  }
  // Has tree drawing characters
  return /[├└]──/.test(trimmed);
}

interface AsciiFlatNode {
  name: string;
  depth: number;
  hintFolder: boolean;
}

function findBranchChar(line: string): number {
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '├' || c === '└') return i;
  }
  return -1;
}

/**
 * Parse an ASCII tree (├── └── format) into TreeNode[].
 */
export function parseAsciiTree(text: string): TreeNode[] {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];

  const flatNodes: AsciiFlatNode[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    const branchIdx = findBranchChar(line);

    if (branchIdx >= 0) {
      const depth = Math.round(branchIdx / 4);
      const dashIdx = line.indexOf('── ', branchIdx);
      if (dashIdx < 0) continue;
      let name = line.slice(dashIdx + 3).trim();
      if (!name) continue;
      const hintFolder = name.endsWith('/');
      if (hintFolder) name = name.slice(0, -1);
      if (!name || name === '.') continue;
      flatNodes.push({ name, depth, hintFolder });
    } else {
      // Root line (no tree characters)
      let name = line.trim();
      if (name === '.' || name === './') continue;
      const hintFolder = name.endsWith('/');
      if (hintFolder) name = name.slice(0, -1);
      if (!name) continue;
      flatNodes.push({ name, depth: -1, hintFolder });
    }
  }

  if (flatNodes.length === 0) return [];

  // Build tree from flat list using stack
  interface BuildNode {
    name: string;
    isFolder: boolean;
    children: BuildNode[];
    _depth: number;
  }

  const virtualRoot: BuildNode = { name: '', isFolder: true, children: [], _depth: -2 };
  const stack: BuildNode[] = [virtualRoot];

  for (const fn of flatNodes) {
    const node: BuildNode = {
      name: fn.name,
      isFolder: fn.hintFolder,
      children: [],
      _depth: fn.depth,
    };

    // Pop stack until we find a parent (depth < current)
    while (stack.length > 1 && stack[stack.length - 1]._depth >= fn.depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];
    parent.children.push(node);
    stack.push(node);
  }

  // Convert to clean TreeNode[], marking nodes with children as folders
  function clean(nodes: BuildNode[]): TreeNode[] {
    return nodes.map(n => {
      const isFolder = n.isFolder || n.children.length > 0;
      const result: TreeNode = { name: n.name, isFolder };
      if (isFolder && n.children.length > 0) {
        result.children = clean(n.children);
      } else if (isFolder) {
        result.children = [];
      }
      return result;
    });
  }

  return clean(virtualRoot.children);
}

// ── Filesystem scanning (build-time only, uses Node.js fs) ──────────

const DEFAULT_EXCLUDES = [
  'node_modules', '.git', '.DS_Store', 'dist', '.cache',
  '.vitepress', '__pycache__', '.next', '.nuxt',
  'Thumbs.db', '.idea', '.vscode', '.hg', '.svn',
  '.turbo', '.output', 'coverage',
];

function simpleGlobMatch(name: string, pattern: string): boolean {
  const re = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${re}$`).test(name);
}

/**
 * Recursively scan a directory and build a TreeNode[] array.
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

// ── Markdown-it plugin ──────────────────────────────────────────────

const DEFAULT_LANGUAGES = ['folder-tree', 'file-tree', 'tree'];

export const FolderTreeMarkdown = (md: any, pluginOptions: PluginConfig = {}) => {
  const languages = pluginOptions.languages || DEFAULT_LANGUAGES;

  const iconMapAttr = pluginOptions.iconMap && Object.keys(pluginOptions.iconMap).length
    ? ` icon-map="${encodeURIComponent(JSON.stringify(pluginOptions.iconMap))}"`
    : '';

  const fence =
    md.renderer.rules.fence?.bind(md.renderer.rules) ||
    ((tokens: any, idx: any, options: any, _env: any, self: any) =>
      self.renderToken(tokens, idx, options));

  md.renderer.rules.fence = (
    tokens: any,
    idx: number,
    options: any,
    _env: any,
    self: any,
  ) => {
    const token = tokens[idx];
    const info = token.info.trim().toLowerCase();

    if (!languages.includes(info)) {
      return fence(tokens, idx, options, _env, self);
    }

    const content: string = token.content;

    try {
      const parsed = YAML.parse(content.trim());
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const blockOpts: Record<string, boolean> = {};
        if (parsed.options && typeof parsed.options === 'object') {
          for (const [k, v] of Object.entries(parsed.options)) {
            if (typeof v === 'boolean') blockOpts[k] = v;
          }
        }
        const defaultOpen = blockOpts.defaultOpen ?? (pluginOptions.defaultOpen !== false);
        const showToolbar = blockOpts.showToolbar ?? (pluginOptions.showToolbar !== false);
        const showBadges = blockOpts.showBadges ?? (pluginOptions.showBadges !== false);
        const interactive = blockOpts.interactive ?? (pluginOptions.interactive !== false);

        const ERR_STYLE = 'padding:12px 16px;margin:16px 0;border-radius:8px;border:1px solid #fca5a5;background:#fef2f2;font-size:13px;line-height:1.5';

        if (parsed.url) {
          const configUrl = String(parsed.url);
          return `<VpFolderTree configUrl="${md.utils.escapeHtml(configUrl)}" :default-open="${defaultOpen}" :show-toolbar="${showToolbar}" :show-badges="${showBadges}" :interactive="${interactive}"${iconMapAttr} />`;
        }

        if (parsed.from) {
          const fromPath = String(parsed.from);
          const depth = typeof parsed.depth === 'number' && parsed.depth > 0 ? parsed.depth : 10;
          const userExcludes: string[] = Array.isArray(parsed.exclude) ? parsed.exclude.map(String) : [];
          const userIncludes: string[] = Array.isArray(parsed.include) ? parsed.include.map(String) : [];
          const excludes = [...DEFAULT_EXCLUDES, ...userExcludes];
          const showRoot = parsed.showRoot !== false;
          const rootName = typeof parsed.name === 'string' ? parsed.name : undefined;

          const resolvedRoot = pluginOptions.root || process.cwd();
          const absolutePath = nodePath.isAbsolute(fromPath)
            ? fromPath
            : nodePath.resolve(resolvedRoot, fromPath);

          if (!fs.existsSync(absolutePath)) {
            return `<div style="${ERR_STYLE}"><strong style="color:#dc2626">Folder Tree Error</strong><p style="margin:4px 0 0;color:#dc2626">Directory not found: ${md.utils.escapeHtml(fromPath)}</p></div>`;
          }

          let stat: fs.Stats;
          try { stat = fs.statSync(absolutePath); } catch {
            return `<div style="${ERR_STYLE}"><strong style="color:#dc2626">Folder Tree Error</strong><p style="margin:4px 0 0;color:#dc2626">Cannot access: ${md.utils.escapeHtml(fromPath)}</p></div>`;
          }

          if (!stat.isDirectory()) {
            return `<div style="${ERR_STYLE}"><strong style="color:#dc2626">Folder Tree Error</strong><p style="margin:4px 0 0;color:#dc2626">Not a directory: ${md.utils.escapeHtml(fromPath)}</p></div>`;
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
            return `<div style="${ERR_STYLE}"><strong style="color:#dc2626">Folder Tree Error</strong><p style="margin:4px 0 0;color:#dc2626">No files found in: ${md.utils.escapeHtml(fromPath)}</p></div>`;
          }

          const encoded = encodeURIComponent(JSON.stringify(tree));
          return `<VpFolderTree data="${encoded}" :default-open="${defaultOpen}" :show-toolbar="${showToolbar}" :show-badges="${showBadges}" :interactive="${interactive}"${iconMapAttr} />`;
        }
      }
    } catch {
      // fall through
    }

    if (isAsciiTree(content)) {
      try {
        const tree = parseAsciiTree(content);
        if (tree.length === 0) {
          return `<div style="padding:12px 16px;margin:16px 0;border-radius:8px;border:1px solid #fca5a5;background:#fef2f2;font-size:13px;line-height:1.5"><strong style="color:#dc2626">Folder Tree Error</strong><p style="margin:4px 0 0;color:#dc2626">Could not parse any nodes from the ASCII tree.</p></div>`;
        }

        const encoded = encodeURIComponent(JSON.stringify(tree));
        const defaultOpen = pluginOptions.defaultOpen !== false;
        const showToolbar = pluginOptions.showToolbar !== false;
        const showBadges = pluginOptions.showBadges !== false;
        const interactive = pluginOptions.interactive !== false;

        return `<VpFolderTree data="${encoded}" :default-open="${defaultOpen}" :show-toolbar="${showToolbar}" :show-badges="${showBadges}" :interactive="${interactive}"${iconMapAttr} />`;
      } catch (e: any) {
        const errorMsg = e.message || 'Unknown error';
        return `<div style="padding:12px 16px;margin:16px 0;border-radius:8px;border:1px solid #fca5a5;background:#fef2f2;font-size:13px;line-height:1.5"><strong style="color:#dc2626">Folder Tree Error</strong><p style="margin:4px 0 0;color:#dc2626">${md.utils.escapeHtml(errorMsg)}</p></div>`;
      }
    }

    const validation = validateTreeInput(content);

    if (!validation.valid) {
      const errHtml = validation.errors.map((e) => `<li>${md.utils.escapeHtml(e)}</li>`).join('');
      const warnHtml = validation.warnings.length
        ? `<ul style="margin:4px 0 0;padding-left:1.2em;color:#b45309">${validation.warnings.map((w) => `<li>${md.utils.escapeHtml(w)}</li>`).join('')}</ul>`
        : '';
      return `<div style="padding:12px 16px;margin:16px 0;border-radius:8px;border:1px solid #fca5a5;background:#fef2f2;font-size:13px;line-height:1.5"><strong style="color:#dc2626">Folder Tree Error</strong><ul style="margin:4px 0 0;padding-left:1.2em;color:#dc2626">${errHtml}</ul>${warnHtml}</div>`;
    }

    try {
      const { tree, options: blockOpts } = parseTree(content);

      if (tree.length === 0) {
        return `<div style="padding:12px 16px;margin:16px 0;border-radius:8px;border:1px solid #fca5a5;background:#fef2f2;font-size:13px;line-height:1.5"><strong style="color:#dc2626">Folder Tree Error</strong><p style="margin:4px 0 0;color:#dc2626">Could not parse any nodes from the provided YAML.</p></div>`;
      }

      let warningBanner = '';
      if (validation.warnings.length) {
        const wHtml = validation.warnings.map((w) => `<li>${md.utils.escapeHtml(w)}</li>`).join('');
        warningBanner = `<div style="padding:8px 12px;margin:0 0 4px;border-radius:6px;border:1px solid #fde68a;background:#fffbeb;font-size:12px;line-height:1.4;color:#92400e"><strong>Warning:</strong><ul style="margin:2px 0 0;padding-left:1.2em">${wHtml}</ul></div>`;
      }

      const encoded = encodeURIComponent(JSON.stringify(tree));
      const defaultOpen = blockOpts.defaultOpen ?? (pluginOptions.defaultOpen !== false);
      const showToolbar = blockOpts.showToolbar ?? (pluginOptions.showToolbar !== false);
      const showBadges = blockOpts.showBadges ?? (pluginOptions.showBadges !== false);
      const interactive = blockOpts.interactive ?? (pluginOptions.interactive !== false);

      return `${warningBanner}<VpFolderTree data="${encoded}" :default-open="${defaultOpen}" :show-toolbar="${showToolbar}" :show-badges="${showBadges}" :interactive="${interactive}"${iconMapAttr} />`;
    } catch (e: any) {
      const errorMsg = e.message || 'Unknown error';
      return `<div style="padding:12px 16px;margin:16px 0;border-radius:8px;border:1px solid #fca5a5;background:#fef2f2;font-size:13px;line-height:1.5"><strong style="color:#dc2626">Folder Tree Error</strong><p style="margin:4px 0 0;color:#dc2626">${md.utils.escapeHtml(errorMsg)}</p></div>`;
    }
  };
};
