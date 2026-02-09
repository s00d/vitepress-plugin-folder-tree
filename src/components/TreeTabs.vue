<template>
  <div v-if="tabs.length > 1" class="vft-tab-bar">
    <button
      v-for="t in tabs"
      :key="t"
      :class="['vft-tab', { 'is-active': activeTab === t }]"
      @click="$emit('select', t)"
    >{{ t }}</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ tabs: string[]; activeTab: string }>();
defineEmits<{ select: [tab: string] }>();
</script>
