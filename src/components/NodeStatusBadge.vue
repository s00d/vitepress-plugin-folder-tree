<template>
  <span :class="['vft-status-indicator', color.badgeClass]">{{ color.text }}</span>
</template>

<script setup lang="ts">
import type { StatusColorInfo } from '../utils/types';
defineProps<{ color: StatusColorInfo }>();
</script>
