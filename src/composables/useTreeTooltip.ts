import { reactive } from 'vue';
import type { TooltipState, TreeNode } from '../utils/types';

export function useTreeTooltip() {
  const tooltip: TooltipState = reactive({
    visible: false,
    text: '',
    x: 0,
    y: 0,
  });

  let showTimer: ReturnType<typeof setTimeout> | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  function onNodeTooltipEnter(e: MouseEvent, node: TreeNode) {
    if (!node.preview) return;
    // Cancel pending hide
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    // Small delay to avoid flashing on fast mouse moves
    if (showTimer) clearTimeout(showTimer);
    showTimer = setTimeout(() => {
      tooltip.text = node.preview!;
      tooltip.x = e.clientX;
      tooltip.y = e.clientY;
      tooltip.visible = true;
    }, 120);
  }

  function onNodeTooltipLeave() {
    if (showTimer) { clearTimeout(showTimer); showTimer = null; }
    // Small delay before hiding so tooltip doesn't flash
    hideTimer = setTimeout(() => {
      tooltip.visible = false;
    }, 100);
  }

  function cleanup() {
    if (showTimer) clearTimeout(showTimer);
    if (hideTimer) clearTimeout(hideTimer);
    tooltip.visible = false;
  }

  return { tooltip, onNodeTooltipEnter, onNodeTooltipLeave, cleanup };
}
