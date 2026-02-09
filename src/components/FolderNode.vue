<template>
  <div v-if="visible">
    <!-- Row -->
    <div
      :class="['vft-row', { 'is-focused': isFocused, 'is-pointer': canToggle, 'is-highlighted': !statusColor && node.highlight }, extraRowClass]"
      :data-path="path"
      tabindex="-1"
      role="treeitem"
      :aria-expanded="isOpen ? 'true' : 'false'"
      @click.stop="onClick"
      @keydown="onKeyDown"
      @mouseenter="onMouseEnter"
      @mouseleave="ctx.onNodeTooltipLeave()"
      @contextmenu="onCtxMenu"
    >
      <!-- Indentation -->
      <span v-if="depth > 0" class="vft-indent" :style="{ width: depth * INDENT_PX + 'px' }"></span>

      <!-- Chevron -->
      <svg :class="['vft-chevron', { 'is-open': isOpen, 'is-disabled': !canToggle }]" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>

      <!-- Custom icon -->
      <span v-if="node.icon && isClassIcon(node.icon)" :class="node.icon" class="vft-icon"></span>
      <span v-else-if="node.icon" class="vft-icon--emoji">{{ node.icon }}</span>
      <!-- Default folder icon -->
      <FolderIcon v-else :open="isOpen" />

      <!-- Status badge -->
      <NodeStatusBadge v-if="statusColor" :color="statusColor" />

      <!-- Name -->
      <a v-if="node.href" :href="node.href" :class="['vft-folder-link', { 'is-deleted': isDeleted }, extraNameClass]" @click.stop>{{ node.name }}</a>
      <span v-else :class="['vft-folder-name', { 'is-deleted': isDeleted }, extraNameClass]">
        <template v-if="searchMatch">{{ searchMatch.before }}<mark class="vft-search-mark">{{ searchMatch.match }}</mark>{{ searchMatch.after }}</template>
        <template v-else>{{ node.name }}</template>
      </span>

      <!-- Lock -->
      <svg v-if="node.locked" class="vft-lock" viewBox="0 0 16 16" fill="none">
        <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none" />
        <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
      </svg>

      <!-- Description / badge -->
      <NodeBadge v-if="node.description" :text="node.description" />
      <NodeBadge v-else-if="showBadges && stats && badgeText" :text="badgeText" />

      <!-- Note -->
      <NodeNote v-if="node.note" :text="node.note" />
    </div>

    <!-- Children collapse -->
    <div v-if="hasChildren" :class="['vft-collapse', { 'is-open': isOpen }]">
      <div class="vft-collapse-inner">
        <div class="vft-branch-group" style="margin-left:0">
          <span class="vft-guide" :style="{ left: guideLeft + 'px' }"></span>
          <ul class="vft-children-list">
            <li v-for="(child, ci) in children" :key="child.name + ci">
              <FolderNode
                v-if="child.isFolder"
                :node="child"
                :depth="depth + 1"
                :path="path + '/' + child.name"
                :expanded-map="expandedMap"
                :interactive="interactive"
                :show-badges="showBadges"
                :search="search"
                :parent-matched="childParentMatched"
                @toggle="(p: string) => $emit('toggle', p)"
              />
              <FileNode
                v-else
                :node="child"
                :depth="depth + 1"
                :path="path + '/' + child.name"
                :interactive="interactive"
                :search="search"
                :parent-matched="childParentMatched"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { TreeNode, FolderTreeContext } from '../utils/types';
import { STATUS_COLORS, INDENT_PX, GUIDE_OFFSET, FOLDER_TREE_CTX_KEY } from '../utils/constants';
import { isClassIcon } from '../utils/icons';
import FolderIcon from './FolderIcon.vue';
import { countChildren } from '../utils/tree-helpers';
import { nodeOrDescendantInSet } from '../utils/search-helpers';
import FileNode from './FileNode.vue';
import NodeStatusBadge from './NodeStatusBadge.vue';
import NodeBadge from './NodeBadge.vue';
import NodeNote from './NodeNote.vue';

const props = withDefaults(defineProps<{
  node: TreeNode;
  depth?: number;
  path: string;
  expandedMap: Record<string, boolean>;
  interactive?: boolean;
  showBadges?: boolean;
  search?: string;
  parentMatched?: boolean;
}>(), {
  depth: 0,
  interactive: true,
  showBadges: true,
  search: '',
  parentMatched: false,
});

const emit = defineEmits<{
  (e: 'toggle', path: string): void;
}>();

const ctx = inject<FolderTreeContext>(FOLDER_TREE_CTX_KEY)!;

const isOpen = computed(() => !!props.expandedMap[props.path]);
const children = computed(() => props.node.children || []);
const hasChildren = computed(() => children.value.length > 0);
const isLocked = computed(() => !!props.node.locked);
const canToggle = computed(() => props.interactive && !isLocked.value);
const isFocused = computed(() => props.path === ctx.focusedPath.value);
const isDeleted = computed(() => props.node.status === 'removed');

const stats = computed(() => countChildren(props.node));
const badgeText = computed(() => {
  if (!stats.value) return '';
  const parts: string[] = [];
  if (stats.value.folders > 0) parts.push(stats.value.folders + ' folder' + (stats.value.folders > 1 ? 's' : ''));
  if (stats.value.files > 0) parts.push(stats.value.files + ' file' + (stats.value.files > 1 ? 's' : ''));
  return parts.join(', ');
});

const statusColor = computed(() =>
  props.node.status ? STATUS_COLORS[props.node.status] ?? null : null,
);

// ─── Visibility ──────────────────────────────────────────────────────
const visible = computed(() => {
  const matched = ctx.matchedNodes.value;
  if (!matched) return true;
  if (props.parentMatched) return true;
  return nodeOrDescendantInSet(props.node, matched);
});

const childParentMatched = computed(() => {
  const matched = ctx.matchedNodes.value;
  if (!matched) return false;
  return props.parentMatched || matched.has(props.node);
});

const guideLeft = computed(() => props.depth * INDENT_PX + GUIDE_OFFSET);

// ─── Extra classes (status) ──────────────────────────────────────────
const extraRowClass = computed(() => statusColor.value?.rowClass ?? '');
const extraNameClass = computed(() => statusColor.value?.nameClass ?? '');

const searchMatch = computed(() => {
  if (!props.search) return null;
  const lower = props.node.name.toLowerCase();
  const idx = lower.indexOf(props.search);
  if (idx < 0) return null;
  return {
    before: props.node.name.slice(0, idx),
    match: props.node.name.slice(idx, idx + props.search.length),
    after: props.node.name.slice(idx + props.search.length),
  };
});

function onClick(e: MouseEvent) {
  if (e.ctrlKey || e.metaKey) {
    ctx.onNodeContextMenu(e, props.node, props.path);
    return;
  }
  if (canToggle.value) emit('toggle', props.path);
}

function onKeyDown(e: KeyboardEvent) {
  if (!canToggle.value) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    emit('toggle', props.path);
  }
}

function onMouseEnter(e: MouseEvent) {
  ctx.handleHoverBranch(props.path);
  ctx.onNodeTooltipEnter(e, props.node);
}

function onCtxMenu(e: MouseEvent) {
  ctx.onNodeContextMenu(e, props.node, props.path);
}
</script>
