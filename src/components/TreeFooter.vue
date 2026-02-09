<template>
  <div v-if="visible" class="vft-footer">
    <svg class="vft-btn-icon" viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M3 6a2 2 0 012-2h4.172a2 2 0 011.414.586L12 6h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" fill="currentColor" opacity="0.35"/></svg>
    {{ stats.folders }} {{ stats.folders === 1 ? 'folder' : 'folders' }}
    <span class="vft-footer-dot">&middot;</span>
    <svg class="vft-btn-icon" viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="currentColor" opacity="0.35"/><path d="M14 2v6h6" stroke="currentColor" opacity="0.35" stroke-width="1"/></svg>
    {{ stats.files }} {{ stats.files === 1 ? 'file' : 'files' }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: { files: number; folders: number };
  visible: boolean;
}>();
</script>
