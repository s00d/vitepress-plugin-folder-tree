import { reactive } from 'vue';
import type { TooltipState, TreeNode } from '../utils/types';

export function useTreeTooltip() {
  const tooltip: TooltipState = reactive({
    visible: false,
    text: '',
    x: 0,
    y: 0,
  });

  let hoverTimer: ReturnType<typeof setTimeout> | null = null;

  function onNodeTooltipEnter(e: MouseEvent, node: TreeNode) {
    if (!node.preview) return;
    hoverTimer = setTimeout(() => {
      tooltip.text = node.preview!;
      tooltip.x = e.clientX + 15;
      tooltip.y = e.clientY + 10;
      tooltip.visible = true;
    }, 600);
  }

  function onNodeTooltipLeave() {
    if (hoverTimer) clearTimeout(hoverTimer);
    tooltip.visible = false;
  }

  function cleanup() {
    if (hoverTimer) clearTimeout(hoverTimer);
  }

  return { tooltip, onNodeTooltipEnter, onNodeTooltipLeave, cleanup };
}
