<template>
  <div class="vft-toolbar">
    <button class="vft-btn" @click="$emit('expand-all')" title="Expand all">
      <svg class="vft-btn-icon" viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button class="vft-btn" @click="$emit('collapse-all')" title="Collapse all">
      <svg class="vft-btn-icon" viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <span class="vft-sep"></span>
    <button class="vft-btn" @click="$emit('copy')" :title="copyLabel">
      <svg v-if="copyLabel === 'Copy'" class="vft-btn-icon" viewBox="0 0 16 16" fill="none" width="14" height="14"><rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M3 11V3a1 1 0 011-1h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      <svg v-else class="vft-btn-icon" viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <TreeDownloadMenu
      :visible="showDownloadMenu"
      @toggle="$emit('update:showDownloadMenu', !showDownloadMenu)"
      @close="$emit('update:showDownloadMenu', false)"
      @download="$emit('download', $event)"
    />
    <span class="vft-sep"></span>
    <button class="vft-btn" @click="$emit('shell')" :title="shellCopied ? 'Copied!' : 'Copy shell script'">
      <svg v-if="!shellCopied" class="vft-btn-icon" viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M2 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <svg v-else class="vft-btn-icon" viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <TreeSearch
      :model-value="searchQuery"
      @update:model-value="$emit('update:searchQuery', $event)"
      @search="$emit('search')"
    />
  </div>
</template>

<script setup lang="ts">
import TreeDownloadMenu from './TreeDownloadMenu.vue';
import TreeSearch from './TreeSearch.vue';

defineProps<{
  copyLabel: string;
  shellCopied: boolean;
  searchQuery: string;
  showDownloadMenu: boolean;
}>();

defineEmits<{
  'expand-all': [];
  'collapse-all': [];
  copy: [];
  shell: [];
  search: [];
  download: [format: string];
  'update:searchQuery': [value: string];
  'update:showDownloadMenu': [value: boolean];
}>();
</script>
