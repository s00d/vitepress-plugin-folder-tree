import { onMounted, onUnmounted } from 'vue';

/**
 * Register an event listener on mount and automatically remove it on unmount.
 *
 * SSR-safe: if `target` is `null`/`undefined` (e.g. `typeof window === 'undefined'`),
 * the call is silently skipped.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  target: Window | null | undefined,
  event: K,
  handler: (e: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void;
export function useEventListener(
  target: EventTarget | null | undefined,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): void;
export function useEventListener(
  target: EventTarget | null | undefined,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  if (!target) return;
  onMounted(() => target.addEventListener(event, handler, options));
  onUnmounted(() => target.removeEventListener(event, handler, options));
}
