import { reactive } from 'vue';
import type { TooltipState, TreeNode } from '../utils/types';

export function useTreeTooltip() {
  const tooltip: TooltipState = reactive({
    visible: false,
    text: '',
    x: 0,
    y: 0,
  });

  function onNodeTooltipEnter(e: MouseEvent, node: TreeNode) {
    if (!node.preview) return;
    tooltip.text = node.preview!;
    tooltip.x = e.clientX + 15;
    tooltip.y = e.clientY + 10;
    tooltip.visible = true;
  }

  function onNodeTooltipLeave() {
    tooltip.visible = false;
  }

  function cleanup() {
    tooltip.visible = false;
  }

  return { tooltip, onNodeTooltipEnter, onNodeTooltipLeave, cleanup };
}
