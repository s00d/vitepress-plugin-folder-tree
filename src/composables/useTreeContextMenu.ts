import { reactive } from 'vue';
import { useClipboard } from './useClipboard';
import type { CtxMenuState, TreeNode } from '../utils/types';

export function useTreeContextMenu() {
  const ctxMenu: CtxMenuState = reactive({
    visible: false,
    x: 0,
    y: 0,
    path: '',
    name: '',
  });

  const { copy } = useClipboard();

  function closeCtx() {
    ctxMenu.visible = false;
  }

  function onNodeContextMenu(e: MouseEvent, node: TreeNode, path: string) {
    e.preventDefault();
    e.stopPropagation();
    ctxMenu.visible = true;
    ctxMenu.x = e.clientX;
    ctxMenu.y = e.clientY;
    ctxMenu.path = path;
    ctxMenu.name = node.name;
  }

  function copyCtx(type: 'name' | 'path') {
    const text = type === 'name' ? ctxMenu.name : ctxMenu.path;
    copy(text);
    closeCtx();
  }

  return { ctxMenu, closeCtx, onNodeContextMenu, copyCtx };
}
