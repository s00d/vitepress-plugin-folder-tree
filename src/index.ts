import { type UserConfig } from 'vitepress';
import { FolderTreeMarkdown } from './folder-tree-markdown';
import { FolderTreePlugin } from './folder-tree-plugin';
import type { PluginConfig } from './config';

export { FolderTreeMarkdown } from './folder-tree-markdown';
export { FolderTreePlugin } from './folder-tree-plugin';
export { parseTree, validateTreeInput, parseAsciiTree, isAsciiTree, scanDirectory } from './folder-tree-markdown';
export type { ValidationResult, ParsedTreeData } from './folder-tree-markdown';
export * from './config';

export { UserConfig };

declare module 'vitepress' {
  interface UserConfig {
    folderTree?: PluginConfig;
  }
}

export const withFolderTree = (config: UserConfig) => {
  // 1. Markdown config
  if (!config.markdown) config.markdown = {};
  const markdownConfigOriginal = config.markdown.config || (() => {});
  config.markdown.config = (...args) => {
    FolderTreeMarkdown(...args, config.folderTree);
    markdownConfigOriginal(...args);
  };

  // 2. Vite plugins
  if (!config.vite) config.vite = {};
  if (!config.vite.plugins) config.vite.plugins = [];
  config.vite.plugins.push(FolderTreePlugin(config.folderTree) as any);

  // 3. Vite optimizeDeps
  if (!config.vite.optimizeDeps) config.vite.optimizeDeps = {};
  if (!config.vite.optimizeDeps.include) config.vite.optimizeDeps.include = [];
  config.vite.optimizeDeps.include.push('yaml');

  // 4. SSR
  if (!config.vite.ssr) config.vite.ssr = {};
  if (!config.vite.ssr.noExternal) config.vite.ssr.noExternal = [];
  if (Array.isArray(config.vite.ssr.noExternal)) {
    config.vite.ssr.noExternal.push('vitepress-plugin-folder-tree');
  }

  return config;
};
