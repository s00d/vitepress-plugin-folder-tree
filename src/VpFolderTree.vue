<template>
  <div class="vft-tree vft-container">
    <div
      ref="treeRef"
      tabindex="0"
      class="vft-focus-wrap"
      @keydown="handleKeydown"
      @mouseleave="clearHover"
    >
      <!-- Toolbar -->
      <TreeToolbar
        v-if="showToolbar && interactive"
        :copy-label="copyLabel"
        :shell-copied="shellCopied"
        :search-query="searchQuery"
        :show-download-menu="showDownloadMenu"
        @expand-all="onExpandAll"
        @collapse-all="onCollapseAll"
        @copy="copyAsText"
        @shell="generateShellScript"
        @search="onSearch"
        @download="downloadAs"
        @update:search-query="searchQuery = $event"
        @update:show-download-menu="showDownloadMenu = $event"
      />
      <!-- Tabs -->
      <TreeTabs :tabs="tabs" :active-tab="activeTab" @select="currentTab = $event" />
      <!-- Tree -->
      <ul class="vft-tree-list" role="tree">
        <li v-for="(node, i) in currentTreeData" :key="activeTab + '-' + i" v-show="isNodeVisible(node)">
          <FolderNode
            v-if="node.isFolder"
            :node="node"
            :depth="0"
            :path="node.name"
            :expanded-map="expandedMap"
            :interactive="interactive"
            :show-badges="showBadges"
            :search="searchQueryLower"
            :parent-matched="false"
            @toggle="handleToggle"
          />
          <FileNode
            v-else
            :node="node"
            :depth="0"
            :path="node.name"
            :interactive="interactive"
            :search="searchQueryLower"
            :parent-matched="false"
          />
        </li>
      </ul>
      <!-- No results -->
      <div v-if="searchQuery && !hasVisibleNodes" class="vft-no-results">No matches found</div>
      <!-- Stats footer -->
      <TreeFooter :stats="totalStats" :visible="currentTreeData.length > 0" />
      <!-- Context menu -->
      <TreeContextMenu :menu="ctxMenu" @copy="copyCtx" @close="closeCtx" />
      <!-- Preview tooltip -->
      <TreeTooltip :tooltip="tooltip" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch, provide } from 'vue';

// ─── Sub-components ──────────────────────────────────────────────────
import FolderNode from './components/FolderNode.vue';
import FileNode from './components/FileNode.vue';
import TreeToolbar from './components/TreeToolbar.vue';
import TreeTabs from './components/TreeTabs.vue';
import TreeFooter from './components/TreeFooter.vue';
import TreeContextMenu from './components/TreeContextMenu.vue';
import TreeTooltip from './components/TreeTooltip.vue';

// ─── Constants ───────────────────────────────────────────────────────
import { FOLDER_TREE_CTX_KEY } from './utils/constants';

// ─── Composables ─────────────────────────────────────────────────────
import { useEventListener } from './composables/useEventListener';
import { useTreeTabs } from './composables/useTreeTabs';
import { useTreeExpand } from './composables/useTreeExpand';
import { useTreeSearch } from './composables/useTreeSearch';
import { useTreeContextMenu } from './composables/useTreeContextMenu';
import { useTreeTooltip } from './composables/useTreeTooltip';
import { useTreeDeepLink } from './composables/useTreeDeepLink';
import { useTreeKeyboard } from './composables/useTreeKeyboard';
import { useTreeClipboard } from './composables/useTreeClipboard';

// ─── Props ───────────────────────────────────────────────────────────
const props = defineProps({
  /** Pre-parsed tree data (resolved at build time). */
  data: { type: Array, default: () => [] },
  defaultOpen: { type: Boolean, default: true },
  showToolbar: { type: Boolean, default: true },
  showBadges: { type: Boolean, default: true },
  interactive: { type: Boolean, default: true },
  /** Custom icon map: { extension: emoji/class }. */
  iconMap: { type: Object, default: () => ({}) },
});

// ─── Refs ────────────────────────────────────────────────────────────
const treeRef = ref(null);

// ─── Icon map ────────────────────────────────────────────────────────
const parsedIconMap = computed(() => props.iconMap || {});

// ─── Tree data (passed directly from build-time) ────────────────────
const treeData = computed(() => props.data);

// ─── Composable: tabs ────────────────────────────────────────────────
const { tabs, currentTab, activeTab, currentTreeData, allTreeNodes } = useTreeTabs(treeData);

// ─── Composable: expand/collapse ─────────────────────────────────────
const { expandedMap, lockedSet, initExpand, onToggle, expandAll, collapseAll } = useTreeExpand(
  allTreeNodes,
  () => props.defaultOpen,
);

// ─── Composable: search ──────────────────────────────────────────────
const { searchQuery, searchQueryLower, matchedNodes, isNodeVisible, hasVisibleNodes, onSearch } = useTreeSearch(
  currentTreeData,
  expandedMap,
);

// ─── Composable: context menu ────────────────────────────────────────
const { ctxMenu, closeCtx, onNodeContextMenu, copyCtx } = useTreeContextMenu();

// ─── Composable: tooltip ─────────────────────────────────────────────
const { tooltip, onNodeTooltipEnter, onNodeTooltipLeave, cleanup: cleanupTooltip } = useTreeTooltip();

// ─── Composable: deep linking ────────────────────────────────────────
const { focusedPath, handleHashChange } = useTreeDeepLink(
  treeData,
  tabs,
  currentTab,
  expandedMap,
  treeRef,
);

// ─── Composable: keyboard ────────────────────────────────────────────
const { handleKeydown, handleHoverBranch, clearHover } = useTreeKeyboard(
  treeRef,
  expandedMap,
  lockedSet,
  ctxMenu,
  closeCtx,
  onNodeTooltipLeave,
  tooltip,
  () => props.interactive,
);

// ─── Composable: clipboard ───────────────────────────────────────────
const {
  copyLabel,
  shellCopied,
  showDownloadMenu,
  copyAsText,
  generateShellScript,
  downloadAs,
} = useTreeClipboard(currentTreeData);

// ─── Statistics ──────────────────────────────────────────────────────
const totalStats = computed(() => {
  let files = 0, folders = 0;
  const count = (nodes) => {
    for (const n of nodes) {
      if (n.isFolder) { folders++; if (n.children) count(n.children); }
      else files++;
    }
  };
  count(currentTreeData.value);
  return { files, folders };
});

// ─── Provide context for FolderNode ──────────────────────────────────
provide(FOLDER_TREE_CTX_KEY, {
  focusedPath,
  parsedIconMap,
  matchedNodes,
  onNodeContextMenu,
  handleHoverBranch,
  onNodeTooltipEnter,
  onNodeTooltipLeave,
});

// ─── Event handlers ──────────────────────────────────────────────────
function handleToggle(path) {
  onToggle(path, props.interactive);
}

function onExpandAll() {
  expandAll(currentTreeData.value, props.interactive);
}

function onCollapseAll() {
  collapseAll(currentTreeData.value, props.interactive);
}

// ─── Close on resize/scroll ──────────────────────────────────────────
function onResize() {
  if (ctxMenu.visible) closeCtx();
  if (tooltip.visible) onNodeTooltipLeave();
}

// ─── Event listeners (auto-cleanup on unmount) ───────────────────────
const _win = typeof window !== 'undefined' ? window : null;
useEventListener(_win, 'hashchange', handleHashChange);
useEventListener(_win, 'resize', onResize);
useEventListener(_win, 'scroll', onResize, { capture: true });

// ─── Lifecycle ───────────────────────────────────────────────────────
onMounted(() => {
  initExpand();
  if (typeof window !== 'undefined' && window.location.hash) handleHashChange();
});

onUnmounted(() => {
  cleanupTooltip();
});

watch(treeData, initExpand);
</script>
