import { ref, nextTick, type Ref, type ComputedRef } from 'vue';
import type { TreeNode } from '../utils/types';

export function useTreeDeepLink(
  treeData: ComputedRef<TreeNode[]>,
  tabs: ComputedRef<string[]>,
  currentTab: Ref<string>,
  expandedMap: Record<string, boolean>,
  treeRef: Ref<HTMLElement | null>,
) {
  const focusedPath = ref('');

  function hasPathInNodes(
    nodes: TreeNode[],
    targetPath: string,
    prefix: string,
  ): boolean {
    for (const n of nodes) {
      const p = prefix ? prefix + '/' + n.name : n.name;
      if (p === targetPath) return true;
      if (n.children && targetPath.startsWith(p + '/')) {
        if (hasPathInNodes(n.children, targetPath, p)) return true;
      }
    }
    return false;
  }

  function handleHashChange() {
    const raw = window.location.hash.slice(1);
    if (!raw) return;
    const hash = decodeURIComponent(raw);

    // Check if path exists in our tree (avoid conflict with heading anchors)
    let found = false;

    if (tabs.value.length > 0) {
      for (const tab of tabs.value) {
        const tabNodes = treeData.value.filter((n) => n.tab === tab);
        const children = tabNodes.flatMap((n) => n.children || []);
        if (hasPathInNodes(children, hash, '')) {
          currentTab.value = tab;
          found = true;
          break;
        }
      }
    } else {
      found = hasPathInNodes(treeData.value, hash, '');
    }

    if (!found) return;

    // Expand all ancestors
    const parts = hash.split('/');
    let current = '';
    for (let i = 0; i < parts.length; i++) {
      current = current ? current + '/' + parts[i] : parts[i];
      expandedMap[current] = true;
    }

    focusedPath.value = hash;

    nextTick(() => {
      setTimeout(() => {
        if (!treeRef.value) return;
        const rows = treeRef.value.querySelectorAll('.vft-row');
        const el = Array.from(rows).find(
          (r) => (r as HTMLElement).dataset.path === hash,
        );
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    });

    setTimeout(() => {
      focusedPath.value = '';
    }, 3000);
  }

  return { focusedPath, handleHashChange };
}
