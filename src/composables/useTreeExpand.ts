import { reactive } from 'vue';
import type { ComputedRef } from 'vue';
import type { TreeNode, FolderInfo } from '../utils/types';

export function useTreeExpand(
  allTreeNodes: ComputedRef<TreeNode[]>,
  defaultOpen: () => boolean,
) {
  const expandedMap: Record<string, boolean> = reactive({});
  const lockedSet: Set<string> = reactive(new Set());

  function collectFolderInfo(
    nodes: TreeNode[],
    prefix: string,
    result: FolderInfo[],
  ) {
    for (const n of nodes) {
      if (!n.isFolder) continue;
      const p = prefix ? prefix + '/' + n.name : n.name;
      const isOpen = n.open !== undefined ? n.open : defaultOpen();
      result.push({ path: p, open: isOpen, locked: !!n.locked });
      if (n.children) collectFolderInfo(n.children, p, result);
    }
  }

  function initExpand() {
    const entries: FolderInfo[] = [];
    collectFolderInfo(allTreeNodes.value, '', entries);
    for (const e of entries) {
      if (expandedMap[e.path] === undefined) expandedMap[e.path] = e.open;
      if (e.locked) lockedSet.add(e.path);
    }
  }

  function onToggle(path: string, interactive: boolean) {
    if (!interactive) return;
    if (lockedSet.has(path)) return;
    expandedMap[path] = !expandedMap[path];
  }

  function expandAll(currentTreeData: TreeNode[], interactive: boolean) {
    if (!interactive) return;
    const entries: FolderInfo[] = [];
    collectFolderInfo(currentTreeData, '', entries);
    for (const e of entries) {
      if (!lockedSet.has(e.path)) expandedMap[e.path] = true;
    }
  }

  function collapseAll(currentTreeData: TreeNode[], interactive: boolean) {
    if (!interactive) return;
    const entries: FolderInfo[] = [];
    collectFolderInfo(currentTreeData, '', entries);
    for (const e of entries) {
      if (!lockedSet.has(e.path)) expandedMap[e.path] = false;
    }
  }

  return {
    expandedMap,
    lockedSet,
    collectFolderInfo,
    initExpand,
    onToggle,
    expandAll,
    collapseAll,
  };
}
