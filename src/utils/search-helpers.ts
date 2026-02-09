import type { TreeNode } from './types';

/**
 * Check if the node itself matches the search query
 * (name, description, or note) — exact substring match.
 */
export function nodeSelfMatches(node: TreeNode, query: string): boolean {
  if (!query) return true;
  if (node.name.toLowerCase().includes(query)) return true;
  if (node.description && node.description.toLowerCase().includes(query)) return true;
  if (node.note && node.note.toLowerCase().includes(query)) return true;
  return false;
}

/**
 * Check if the node or any of its descendants match the query — exact substring.
 */
export function nodeTreeMatches(node: TreeNode, query: string): boolean {
  if (!query) return true;
  if (nodeSelfMatches(node, query)) return true;
  if (node.children) return node.children.some((c) => nodeTreeMatches(c, query));
  return false;
}

/**
 * Check if the node or any descendant is in the pre-computed matched set (Fuse.js).
 */
export function nodeOrDescendantInSet(node: TreeNode, matched: Set<TreeNode>): boolean {
  if (matched.has(node)) return true;
  if (node.children) return node.children.some((c) => nodeOrDescendantInSet(c, matched));
  return false;
}
