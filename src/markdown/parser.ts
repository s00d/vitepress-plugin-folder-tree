import YAML from 'yaml';
import type { TreeNode } from '../config';
import { convertItems } from '../utils/tree-parser';

// Re-export pure functions (no YAML dependency)
export { isAsciiTree, parseAsciiTree, convertItems, extractBlockOptions } from '../utils/tree-parser';

// ─── Types ───────────────────────────────────────────────────────────

export interface ParsedTreeData {
  tree: TreeNode[];
  options: Record<string, boolean>;
}

// ─── YAML → TreeNode[] (server-side, uses static YAML import) ───────

/**
 * Parse a raw YAML string into a tree.
 *
 * This function uses a **static** YAML import and is intended for
 * server-side use (markdown-it plugin). Client-side code should
 * lazy-load YAML and call `convertItems()` directly.
 */
export function parseTree(raw: string): ParsedTreeData {
  const parsed = YAML.parse(raw.trim());

  // Format: object with `tree` key
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.tree)) {
    const options: Record<string, boolean> = {};
    if (parsed.options && typeof parsed.options === 'object') {
      for (const [k, v] of Object.entries(parsed.options)) {
        if (typeof v === 'boolean') options[k] = v;
      }
    }
    return { tree: convertItems(parsed.tree), options };
  }

  // Format: plain array
  if (!Array.isArray(parsed)) return { tree: [], options: {} };
  return { tree: convertItems(parsed), options: {} };
}
