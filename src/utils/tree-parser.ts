import type { TreeNode, YamlInputItem, YamlInputObject } from '../config';

// ─── YAML items → TreeNode[] (pure, no YAML import) ──────────────────

/**
 * Convert already-parsed YAML items into internal `TreeNode[]` structure.
 * This is a pure function — it works on plain JS objects, not raw YAML strings.
 */
export function convertItems(items: YamlInputItem[]): TreeNode[] {
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

// ─── Block options extraction ────────────────────────────────────────

/**
 * Extract per-block boolean options from a parsed YAML object.
 */
export function extractBlockOptions(parsed: Record<string, unknown>): Record<string, boolean> {
  const opts: Record<string, boolean> = {};
  if (parsed.options && typeof parsed.options === 'object') {
    for (const [k, v] of Object.entries(parsed.options as Record<string, unknown>)) {
      if (typeof v === 'boolean') opts[k] = v;
    }
  }
  return opts;
}

// ─── ASCII tree detection ────────────────────────────────────────────

/**
 * Detect if text looks like an ASCII tree (├── └── │ characters).
 */
export function isAsciiTree(text: string): boolean {
  const trimmed = text.trim();
  const firstLine = trimmed.split('\n')[0]?.trim() || '';
  if (
    firstLine.startsWith('- ') ||
    firstLine.startsWith('options:') ||
    firstLine.startsWith('tree:') ||
    firstLine.startsWith('url:') ||
    firstLine.startsWith('name:') ||
    firstLine.startsWith('from:')
  ) {
    return false;
  }
  return /[├└]──/.test(trimmed);
}

// ─── ASCII tree parser ──────────────────────────────────────────────

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
 * Parse an ASCII tree (├── └── format) into `TreeNode[]`.
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
      let name = line.trim();
      if (name === '.' || name === './') continue;
      const hintFolder = name.endsWith('/');
      if (hintFolder) name = name.slice(0, -1);
      if (!name) continue;
      flatNodes.push({ name, depth: -1, hintFolder });
    }
  }

  if (flatNodes.length === 0) return [];

  // ─── Build tree from flat list using stack ────────────────────

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

    while (stack.length > 1 && stack[stack.length - 1]._depth >= fn.depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];
    parent.children.push(node);
    stack.push(node);
  }

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
