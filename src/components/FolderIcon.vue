<template>
  <!-- Folder open -->
  <svg v-if="open" class="vft-icon" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2h-5.172a2 2 0 01-1.414-.586L11 4H5a2 2 0 00-2 2v11a2 2 0 002 2z"
      class="vft-folder-open-body"
      stroke-width="1"
    />
    <path
      d="M3 13h18l-2.4 6H5.4L3 13z"
      class="vft-folder-open-flap"
      stroke-width="1"
    />
  </svg>
  <!-- Folder closed -->
  <svg v-else class="vft-icon" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6a2 2 0 012-2h4.172a2 2 0 011.414.586L12 6h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"
      class="vft-folder-closed"
      stroke-width="1"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>();
</script>
