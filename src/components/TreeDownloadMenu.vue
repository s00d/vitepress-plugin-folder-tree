<template>
  <div ref="triggerRef">
    <button class="vft-btn" @click="onToggle" title="Download">
      <svg class="vft-btn-icon" viewBox="0 0 16 16" fill="none" width="14" height="14">
        <path d="M8 2v8m0 0l-3-3m3 3l3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 12h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
      </svg>
    </button>
  </div>

  <FloatingPanel
    :visible="visible"
    :x="pos.x"
    :y="pos.y"
    :ignore-el="triggerRef"
    @click-outside="$emit('close')"
  >
    <div class="vft-dropdown-panel">
      <button
        v-for="fmt in FORMATS"
        :key="fmt"
        class="vft-dropdown-item"
        @click="$emit('download', fmt)"
      >{{ `.${fmt}` }}</button>
    </div>
  </FloatingPanel>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import FloatingPanel from './FloatingPanel.vue';

const FORMATS = ['txt', 'yaml', 'json'] as const;

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ toggle: []; download: [format: string]; close: [] }>();

const triggerRef = ref<HTMLElement | null>(null);
const pos = reactive({ x: 0, y: 0 });

function onToggle() {
  if (!props.visible && triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect();
    pos.x = rect.left;
    pos.y = rect.bottom + 4;
  }
  emit('toggle');
}
</script>
