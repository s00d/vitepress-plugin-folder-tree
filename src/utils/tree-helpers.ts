import type { TreeNode, TreeStats } from './types';

/**
 * Convert tree nodes to ASCII-art text lines.
 */
export function treeToText(nodes: TreeNode[], prefix: string): string[] {
  const lines: string[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const last = i === nodes.length - 1;
    const connector = last ? '└── ' : '├── ';
    lines.push(prefix + connector + node.name);
    if (node.isFolder && node.children && node.children.length > 0) {
      const childPrefix = prefix + (last ? '    ' : '│   ');
      lines.push(...treeToText(node.children, childPrefix));
    }
  }
  return lines;
}

/**
 * Count immediate children (files vs folders).
 */
export function countChildren(node: TreeNode): TreeStats | null {
  if (!node.children) return null;
  let files = 0;
  let folders = 0;
  for (const c of node.children) {
    if (c.isFolder) folders++;
    else files++;
  }
  return { files, folders };
}

/**
 * Convert tree nodes to a clean export format (for YAML/JSON download).
 */
export function nodesToExportFormat(nodes: TreeNode[]): any[] {
  return nodes.map((n) => {
    if (
      !n.isFolder &&
      !n.description &&
      !n.note &&
      !n.highlight &&
      !n.icon &&
      !n.href &&
      !n.status &&
      !n.preview
    ) {
      return n.name;
    }
    const obj: any = { name: n.name };
    if (n.isFolder) {
      if (n.children && n.children.length) obj.children = nodesToExportFormat(n.children);
      else obj.type = 'folder';
    }
    if (n.description) obj.description = n.description;
    if (n.note) obj.note = n.note;
    if (n.highlight) obj.highlight = true;
    if (n.icon) obj.icon = n.icon;
    if (n.href) obj.href = n.href;
    if (n.status) obj.status = n.status;
    if (n.preview) obj.preview = n.preview;
    return obj;
  });
}
