import { ref } from 'vue';

/**
 * Composable for copying text to the clipboard.
 *
 * Returns a reactive `copied` flag that auto-resets after `duration` ms.
 * Falls back to `document.execCommand('copy')` in insecure contexts.
 */
export function useClipboard(options?: { duration?: number }) {
  const copied = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers / insecure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      copied.value = false;
    }, options?.duration ?? 1500);
    return true;
  }

  return { copy, copied };
}
