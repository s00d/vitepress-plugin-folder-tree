<template>
  <Teleport v-if="mounted" to="body">
    <div
      v-if="visible"
      ref="panelEl"
      :style="panelStyle"
      class="vft-floating-panel"
    >
      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useClickOutside } from '../composables/useClickOutside';

const props = withDefaults(defineProps<{
  visible: boolean;
  x?: number;
  y?: number;
  offsetX?: number;
  offsetY?: number;
  ignoreEl?: HTMLElement | null;
}>(), {
  x: 0,
  y: 0,
  offsetX: 0,
  offsetY: 0,
  ignoreEl: undefined,
});

const emit = defineEmits<{
  'click-outside': [];
}>();

const panelEl = ref<HTMLElement | null>(null);
const mounted = ref(false);
const adjustedX = ref(0);
const adjustedY = ref(0);

onMounted(() => {
  mounted.value = true;
});

// Clamp position to viewport after the panel renders
function clampToViewport() {
  const el = panelEl.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 8;

  let x = props.x + props.offsetX;
  let y = props.y + props.offsetY;

  // Prevent going off right edge
  if (x + rect.width > vw - pad) {
    x = Math.max(pad, vw - rect.width - pad);
  }
  // Prevent going off bottom edge
  if (y + rect.height > vh - pad) {
    y = Math.max(pad, vh - rect.height - pad);
  }
  // Prevent going off left/top edge
  if (x < pad) x = pad;
  if (y < pad) y = pad;

  adjustedX.value = x;
  adjustedY.value = y;
}

watch(() => props.visible, async (v) => {
  if (v) {
    // Set initial position, then clamp after render
    adjustedX.value = props.x + props.offsetX;
    adjustedY.value = props.y + props.offsetY;
    await nextTick();
    clampToViewport();
  }
});

// Also re-clamp when x/y change while visible
watch(() => [props.x, props.y], async () => {
  if (props.visible) {
    adjustedX.value = props.x + props.offsetX;
    adjustedY.value = props.y + props.offsetY;
    await nextTick();
    clampToViewport();
  }
});

const panelStyle = computed(() => ({
  position: 'fixed' as const,
  left: adjustedX.value + 'px',
  top: adjustedY.value + 'px',
  zIndex: 9999,
}));

const ignoreRef = computed(() => props.ignoreEl ?? null);

useClickOutside(panelEl, () => {
  if (props.visible) emit('click-outside');
}, { ignore: [ignoreRef] });

defineExpose({ el: panelEl });
</script>
