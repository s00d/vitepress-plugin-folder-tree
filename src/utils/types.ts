import type { Ref, ComputedRef } from 'vue';
import type { TreeNode } from '../config';

export type { TreeNode };

/** Context menu reactive state */
export interface CtxMenuState {
  visible: boolean;
  x: number;
  y: number;
  path: string;
  name: string;
}

/** Preview tooltip reactive state */
export interface TooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}

/** Status color descriptor (Tailwind class-based) */
export interface StatusColorInfo {
  /** Tailwind classes for the row background + left border */
  rowClass: string;
  /** Tailwind class for badge background */
  badgeClass: string;
  /** Tailwind class for the node name color */
  nameClass: string;
  /** Single-char badge label (A / D / M) */
  text: string;
}

/** Folder metadata collected for expand/collapse */
export interface FolderInfo {
  path: string;
  open: boolean;
  locked: boolean;
}

/** File/folder count statistics */
export interface TreeStats {
  files: number;
  folders: number;
}

/** Injection context provided by VpFolderTree to FolderNode */
export interface FolderTreeContext {
  focusedPath: Ref<string>;
  parsedIconMap: ComputedRef<Record<string, string>>;
  matchedNodes: ComputedRef<Set<TreeNode> | null>;
  onNodeContextMenu: (e: MouseEvent, node: TreeNode, path: string) => void;
  handleHoverBranch: (path: string) => void;
  onNodeTooltipEnter: (e: MouseEvent, node: TreeNode) => void;
  onNodeTooltipLeave: () => void;
}
