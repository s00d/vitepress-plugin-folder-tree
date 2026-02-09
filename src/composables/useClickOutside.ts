import { watch, onUnmounted, type Ref } from 'vue';

/**
 * Detect clicks outside a target element.
 *
 * Automatically starts listening when the target ref is non-null
 * (e.g. after `v-if` renders the element) and stops when it becomes null.
 *
 * Uses `setTimeout(0)` to defer the first listener registration so the
 * same click that opened the panel does not immediately close it.
 */
export function useClickOutside(
  target: Ref<HTMLElement | null>,
  callback: (e: MouseEvent) => void,
  options?: {
    /** Refs to elements whose clicks should be ignored (e.g. trigger buttons). */
    ignore?: Array<Ref<HTMLElement | null>>;
  },
) {
  function handler(e: MouseEvent) {
    const el = target.value;
    if (!el) return;
    const t = e.target as Node;
    if (el.contains(t)) return;
    if (options?.ignore?.some((r) => r.value?.contains(t))) return;
    callback(e);
  }

  watch(target, (el, _, onCleanup) => {
    if (el) {
      const timer = setTimeout(() => {
        document.addEventListener('pointerdown', handler);
      }, 0);
      onCleanup(() => {
        clearTimeout(timer);
        document.removeEventListener('pointerdown', handler);
      });
    }
  });

  onUnmounted(() => {
    document.removeEventListener('pointerdown', handler);
  });
}
