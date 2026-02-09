<template>
  <div
    v-if="visible"
    :class="['vft-row', { 'is-focused': isFocused, 'is-highlighted': !statusColor && node.highlight }, extraRowClass]"
    :data-path="path"
    tabindex="-1"
    role="none"
    @click.stop="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="ctx.onNodeTooltipLeave()"
    @contextmenu="onCtxMenu"
  >
    <!-- Indentation -->
    <span v-if="depth > 0" class="vft-indent" :style="{ width: depth * INDENT_PX + 'px' }"></span>

    <!-- Spacer (no chevron for files) -->
    <span class="vft-spacer"></span>

    <!-- Custom icon (class-based, e.g. Iconify) -->
    <span v-if="customIcon && isClassIcon(customIcon)" :class="customIcon" class="vft-icon"></span>
    <!-- Custom icon (emoji / text) -->
    <span v-else-if="customIcon" class="vft-icon--emoji">{{ customIcon }}</span>
    <!-- Default file icon -->
    <FileIcon v-else :ext="ext" />

    <!-- Status badge -->
    <NodeStatusBadge v-if="statusColor" :color="statusColor" />

    <!-- Name -->
    <a v-if="node.href" :href="node.href" :class="['vft-file-link', { 'is-deleted': isDeleted }, extraNameClass]" @click.stop>{{ node.name }}</a>
    <span v-else :class="['vft-file-name', { 'is-deleted': isDeleted }, extraNameClass]">
      <template v-if="searchMatch">{{ searchMatch.before }}<mark class="vft-search-mark">{{ searchMatch.match }}</mark>{{ searchMatch.after }}</template>
      <template v-else>{{ node.name }}</template>
    </span>

    <!-- Lock -->
    <svg v-if="node.locked" class="vft-lock" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
    </svg>

    <!-- Description badge -->
    <NodeBadge v-if="node.description" :text="node.description" />

    <!-- Note -->
    <NodeNote v-if="node.note" :text="node.note" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import type { TreeNode, FolderTreeContext } from '../utils/types';
import { STATUS_COLORS, INDENT_PX, FOLDER_TREE_CTX_KEY } from '../utils/constants';
import { getExt, isClassIcon, resolveIconMap } from '../utils/icons';
import FileIcon from './FileIcon.vue';
import { nodeOrDescendantInSet } from '../utils/search-helpers';
import NodeStatusBadge from './NodeStatusBadge.vue';
import NodeBadge from './NodeBadge.vue';
import NodeNote from './NodeNote.vue';

const props = withDefaults(defineProps<{
  node: TreeNode;
  depth?: number;
  path: string;
  interactive?: boolean;
  search?: string;
  parentMatched?: boolean;
}>(), {
  depth: 0,
  interactive: true,
  search: '',
  parentMatched: false,
});

const ctx = inject<FolderTreeContext>(FOLDER_TREE_CTX_KEY)!;

const ext = computed(() => getExt(props.node.name));
const statusColor = computed(() =>
  props.node.status ? STATUS_COLORS[props.node.status] ?? null : null,
);

const customIcon = computed(() => {
  if (props.node.icon) return props.node.icon;
  return resolveIconMap(props.node.name, ext.value, ctx.parsedIconMap.value);
});

// ─── Visibility ──────────────────────────────────────────────────────
const visible = computed(() => {
  const matched = ctx.matchedNodes.value;
  if (!matched) return true;
  if (props.parentMatched) return true;
  return nodeOrDescendantInSet(props.node, matched);
});

const isFocused = computed(() => props.path === ctx.focusedPath.value);
const isDeleted = computed(() => props.node.status === 'removed');

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
