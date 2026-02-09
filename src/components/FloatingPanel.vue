<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="panelEl"
      :style="positionStyle"
    >
      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useClickOutside } from '../composables/useClickOutside';

const props = withDefaults(defineProps<{
  /** Whether the panel is shown. */
  visible: boolean;
  /** Horizontal position (px). */
  x?: number;
  /** Vertical position (px). */
  y?: number;
  /** Extra horizontal offset added to `x`. */
  offsetX?: number;
  /** Extra vertical offset added to `y`. */
  offsetY?: number;
  /**
   * Element(s) whose clicks should NOT trigger click-outside (e.g. a trigger button).
   * Pass a single element or null.
   */
  ignoreEl?: HTMLElement | null;
}>(), {
  x: 0,
  y: 0,
  offsetX: 0,
  offsetY: 0,
  ignoreEl: undefined,
});

const emit = defineEmits<{
  /** Fired when a click outside the panel is detected. */
  'click-outside': [];
}>();

const panelEl = ref<HTMLElement | null>(null);

const positionStyle = computed(() => ({
  position: 'fixed' as const,
  left: (props.x + props.offsetX) + 'px',
  top: (props.y + props.offsetY) + 'px',
}));

// Wrap ignoreEl prop in a computed so useClickOutside can reactively read it
const ignoreRef = computed(() => props.ignoreEl ?? null);

useClickOutside(panelEl, () => {
  if (props.visible) emit('click-outside');
}, { ignore: [ignoreRef] });

defineExpose({ el: panelEl });
</script>
