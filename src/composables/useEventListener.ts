import { onMounted, onUnmounted } from 'vue';

/**
 * Register an event listener on mount and automatically remove it on unmount.
 *
 * Equivalent to the removed `@vueuse/core` helper but with zero dependencies.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  target: Window,
  event: K,
  handler: (e: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void;
export function useEventListener(
  target: EventTarget,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): void;
export function useEventListener(
  target: EventTarget,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  onMounted(() => target.addEventListener(event, handler, options));
  onUnmounted(() => target.removeEventListener(event, handler, options));
}
