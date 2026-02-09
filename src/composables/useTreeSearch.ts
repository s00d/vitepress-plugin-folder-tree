import { ref, computed, type ComputedRef } from 'vue';
import type { TreeNode } from '../utils/types';
import { nodeOrDescendantInSet } from '../utils/search-helpers';

/** Check if a node matches the search query (case-insensitive includes). */
function nodeMatches(node: TreeNode, query: string): boolean {
  if (node.name.toLowerCase().includes(query)) return true;
  if (node.description && node.description.toLowerCase().includes(query)) return true;
  if (node.note && node.note.toLowerCase().includes(query)) return true;
  return false;
}

/** Collect all matching nodes from the tree. */
function collectMatches(nodes: TreeNode[], query: string, out: Set<TreeNode>): void {
  for (const node of nodes) {
    if (nodeMatches(node, query)) out.add(node);
    if (node.children) collectMatches(node.children, query, out);
  }
}

export function useTreeSearch(
  currentTreeData: ComputedRef<TreeNode[]>,
  expandedMap: Record<string, boolean>,
) {
  const searchQuery = ref('');
  const searchQueryLower = computed(() => searchQuery.value.toLowerCase());

  // ─── Set of nodes that match the current query ────────────────────
  const matchedNodes = computed<Set<TreeNode> | null>(() => {
    const q = searchQueryLower.value;
    if (!q) return null;
    const set = new Set<TreeNode>();
    collectMatches(currentTreeData.value, q, set);
    return set;
  });

  // ─── Visibility check ─────────────────────────────────────────────
  function isNodeVisible(node: TreeNode): boolean {
    const matched = matchedNodes.value;
    if (!matched) return true;
    return nodeOrDescendantInSet(node, matched);
  }

  const hasVisibleNodes = computed(() => {
    const matched = matchedNodes.value;
    if (!matched) return true;
    return currentTreeData.value.some((n) => nodeOrDescendantInSet(n, matched));
  });

  // ─── Expand folders containing matched nodes ──────────────────────
  function onSearch() {
    const matched = matchedNodes.value;
    if (!matched || !searchQuery.value) return;

    const expandMatching = (nodes: TreeNode[], prefix: string) => {
      for (const n of nodes) {
        if (!n.isFolder) continue;
        const p = prefix ? prefix + '/' + n.name : n.name;
        if (nodeOrDescendantInSet(n, matched)) expandedMap[p] = true;
        if (n.children) expandMatching(n.children, p);
      }
    };
    expandMatching(currentTreeData.value, '');
  }

  return { searchQuery, searchQueryLower, matchedNodes, isNodeVisible, hasVisibleNodes, onSearch };
}
