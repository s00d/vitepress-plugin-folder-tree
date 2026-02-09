<template>
  <FloatingPanel
    :visible="menu.visible"
    :x="menu.x"
    :y="menu.y"
    @click-outside="$emit('close')"
  >
    <div class="vft-ctx-panel" @click.stop>
      <div class="vft-ctx-item" @click="$emit('copy', 'name')">Copy Name</div>
      <div class="vft-ctx-item" @click="$emit('copy', 'path')">Copy Path</div>
    </div>
  </FloatingPanel>
</template>

<script setup lang="ts">
import FloatingPanel from './FloatingPanel.vue';
import type { CtxMenuState } from '../utils/types';

defineProps<{ menu: CtxMenuState }>();
defineEmits<{ copy: [type: 'name' | 'path']; close: [] }>();
</script>
