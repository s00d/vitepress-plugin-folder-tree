import type { Plugin } from 'vite';
import type { PluginConfig } from './config';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const vpFolderTreePath = resolve(__dirname, 'VpFolderTree.vue');

export function FolderTreePlugin(_inlineOptions?: Partial<PluginConfig>): Plugin {
  const vpFolderTreeModuleId = 'vitepress-plugin-folder-tree/VpFolderTree.vue';

  return {
    name: 'vitepress-plugin-folder-tree',
    enforce: 'pre',

    transform(src, id) {
      if (id.includes('vitepress/dist/client/app/index.js')) {
        src = `\nimport VpFolderTree from '${vpFolderTreeModuleId}';\n` + src;

        const lines = src.split('\n');
        const targetLineIndex = lines.findIndex((line) => line.includes('app.component'));

        lines.splice(targetLineIndex, 0, '  app.component("VpFolderTree", VpFolderTree);');
        src = lines.join('\n');

        return { code: src, map: null };
      }
    },

    resolveId(id) {
      if (id === vpFolderTreeModuleId) {
        return vpFolderTreePath;
      }
    },
  };
}
