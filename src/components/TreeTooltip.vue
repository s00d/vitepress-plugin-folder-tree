<template>
  <FloatingPanel
    :visible="tooltip.visible"
    :x="tooltip.x"
    :y="tooltip.y"
    :offset-x="15"
    :offset-y="15"
  >
    <div class="vft-tooltip">
      <pre class="vft-tooltip-pre">{{ tooltip.text }}</pre>
    </div>
  </FloatingPanel>
</template>

<script setup lang="ts">
import FloatingPanel from './FloatingPanel.vue';
import type { TooltipState } from '../utils/types';

defineProps<{ tooltip: TooltipState }>();
</script>
