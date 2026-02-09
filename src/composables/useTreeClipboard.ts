import { ref, computed, type ComputedRef } from 'vue';
import YAML from 'yaml';
import { useClipboard } from './useClipboard';
import type { TreeNode } from '../utils/types';
import { treeToText, nodesToExportFormat } from '../utils/tree-helpers';

export function useTreeClipboard(currentTreeData: ComputedRef<TreeNode[]>) {
  const { copy, copied } = useClipboard({ duration: 1500 });
  const showDownloadMenu = ref(false);

  const copyLabel = computed(() => (copied.value ? 'Copied!' : 'Copy'));

  // ─── Copy as ASCII text ─────────────────────────────────────────

  function copyAsText() {
    const lines = treeToText(currentTreeData.value, '');
    copy(lines.join('\n'));
  }

  // ─── Shell script generation ────────────────────────────────────

  function generateShellScript() {
    const commands: string[] = [];

    function traverse(nodes: TreeNode[], currentPath: string) {
      for (const node of nodes) {
        const safeName = node.name.replace(/([\s()'"`$!&;|<>\\])/g, '\\$1');
        const path = currentPath ? `${currentPath}/${safeName}` : safeName;

        if (node.isFolder) {
          commands.push(`mkdir -p ${path}`);
          if (node.children) traverse(node.children, path);
        } else {
          commands.push(`touch ${path}`);
        }
      }
    }

    traverse(currentTreeData.value, '');
    copy(commands.join('\n'));
  }

  // ─── Download ───────────────────────────────────────────────────

  function downloadAs(format: 'txt' | 'yaml' | 'json') {
    showDownloadMenu.value = false;
    let content: string;
    let mimeType: string;
    let ext: string;

    if (format === 'txt') {
      content = treeToText(currentTreeData.value, '').join('\n');
      mimeType = 'text/plain';
      ext = 'txt';
    } else if (format === 'yaml') {
      content = YAML.stringify(nodesToExportFormat(currentTreeData.value));
      mimeType = 'text/yaml';
      ext = 'yaml';
    } else {
      content = JSON.stringify(
        nodesToExportFormat(currentTreeData.value),
        null,
        2,
      );
      mimeType = 'application/json';
      ext = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tree.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    copyLabel,
    shellCopied: copied,
    showDownloadMenu,
    copyAsText,
    generateShellScript,
    downloadAs,
  };
}
