import type { Ref } from 'vue';
import type { CtxMenuState, TooltipState } from '../utils/types';

export function useTreeKeyboard(
  treeRef: Ref<HTMLElement | null>,
  expandedMap: Record<string, boolean>,
  lockedSet: Set<string>,
  ctxMenu: CtxMenuState,
  closeCtx: () => void,
  onNodeTooltipLeave: () => void,
  tooltip: TooltipState,
  interactive: () => boolean,
) {
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (ctxMenu.visible) {
        closeCtx();
        e.preventDefault();
        return;
      }
      if (tooltip.visible) {
        onNodeTooltipLeave();
        e.preventDefault();
        return;
      }
    }

    // Shift+F10 — open context menu for focused row (standard a11y shortcut)
    if (e.key === 'F10' && e.shiftKey) {
      e.preventDefault();
      const active = document.activeElement as HTMLElement;
      if (
        active &&
        active.classList.contains('vft-row') &&
        active.dataset.path
      ) {
        const path = active.dataset.path;
        const name = path.split('/').pop() || path;
        const rect = active.getBoundingClientRect();
        ctxMenu.visible = true;
        ctxMenu.x = rect.left + rect.width / 2;
        ctxMenu.y = rect.top + rect.height;
        ctxMenu.path = path;
        ctxMenu.name = name;
      }
      return;
    }

    if (!interactive() || !treeRef.value) return;
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key))
      return;

    const rows = Array.from(
      treeRef.value.querySelectorAll('.vft-row'),
    ).filter((r) => (r as HTMLElement).offsetHeight > 0) as HTMLElement[];
    if (!rows.length) return;

    const active = document.activeElement as HTMLElement;
    const idx = rows.indexOf(active);

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = idx < rows.length - 1 ? idx + 1 : 0;
        rows[next].focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = idx > 0 ? idx - 1 : rows.length - 1;
        rows[prev].focus();
        break;
      }
      case 'ArrowRight': {
        if (idx >= 0) {
          const path = rows[idx].dataset?.path;
          if (path && expandedMap[path] === false && !lockedSet.has(path)) {
            expandedMap[path] = true;
            e.preventDefault();
          }
        }
        break;
      }
      case 'ArrowLeft': {
        if (idx >= 0) {
          const path = rows[idx].dataset?.path;
          if (path && expandedMap[path] === true && !lockedSet.has(path)) {
            expandedMap[path] = false;
            e.preventDefault();
          }
        }
        break;
      }
    }
  }

  function handleHoverBranch(path: string) {
    if (!treeRef.value) return;
    const rows = treeRef.value.querySelectorAll('.vft-row');
    rows.forEach((row) => {
      const el = row as HTMLElement;
      if (
        path &&
        el.dataset.path &&
        path !== el.dataset.path &&
        path.startsWith(el.dataset.path + '/')
      ) {
        el.classList.add('vft-on-branch');
      } else {
        el.classList.remove('vft-on-branch');
      }
    });
  }

  function clearHover() {
    if (!treeRef.value) return;
    treeRef.value
      .querySelectorAll('.vft-on-branch')
      .forEach((el) => {
        el.classList.remove('vft-on-branch');
      });
    onNodeTooltipLeave();
  }

  return { handleKeydown, handleHoverBranch, clearHover };
}
