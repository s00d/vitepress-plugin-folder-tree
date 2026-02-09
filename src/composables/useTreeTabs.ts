import { ref, computed, type ComputedRef } from 'vue';
import type { TreeNode } from '../utils/types';

export function useTreeTabs(treeData: ComputedRef<TreeNode[]>) {
  const tabs = computed(() => {
    const data = treeData.value;
    if (!data.length) return [] as string[];
    const tabNames = data.filter((n) => n.tab).map((n) => n.tab!);
    return [...new Set(tabNames)];
  });

  const currentTab = ref('');

  const activeTab = computed(() =>
    currentTab.value || (tabs.value.length > 0 ? tabs.value[0] : ''),
  );

  const currentTreeData = computed<TreeNode[]>(() => {
    if (tabs.value.length === 0) return treeData.value;
    const tab = activeTab.value;
    const tabNodes = treeData.value.filter((n) => n.tab === tab);
    return tabNodes.flatMap((n) => n.children || []);
  });

  /** All nodes across all tabs (for expand state init). */
  const allTreeNodes = computed<TreeNode[]>(() => {
    if (tabs.value.length === 0) return treeData.value;
    return treeData.value.flatMap((n) => (n.tab ? n.children || [] : [n]));
  });

  return { tabs, currentTab, activeTab, currentTreeData, allTreeNodes };
}
