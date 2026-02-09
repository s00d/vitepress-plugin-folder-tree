import YAML from 'yaml';
import type { PluginConfig } from '../config';
import { processFsScan } from './scanner';
import { resolveUrl } from './resolver';
import {
  isAsciiTree,
  parseAsciiTree,
  convertItems,
  extractBlockOptions,
} from '../utils/tree-parser';
import { validateTreeData } from '../utils/tree-validator';

// ─── Re-export public API ────────────────────────────────────────────

export { validateTreeInput, validateTreeData } from './validation';
export type { ValidationResult } from './validation';
export { parseTree } from './parser';
export { parseAsciiTree, isAsciiTree, convertItems } from '../utils/tree-parser';
export type { ParsedTreeData } from './parser';
export { scanDirectory } from './scanner';
export { resolveUrl } from './resolver';
export type { ResolveResult } from './resolver';

// ─── Constants ───────────────────────────────────────────────────────

const DEFAULT_LANGUAGES = ['folder-tree', 'file-tree', 'tree'];

// ─── Helpers (inline — no separate renderer file) ────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Escape a JSON string for use inside a single-quoted HTML attribute. */
function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

function renderError(
  title: string,
  messages: string[],
  warnings: string[] = [],
): string {
  const body =
    messages.length === 1
      ? `<p class="vft-error-text">${escapeHtml(messages[0])}</p>`
      : `<ul class="vft-error-list">${messages.map(m => `<li class="vft-error-item">${escapeHtml(m)}</li>`).join('')}</ul>`;

  const warnBody =
    warnings.length > 0
      ? `<ul class="vft-error-warnings">${warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul>`
      : '';

  return (
    `<div class="vft-error-block">` +
    `<span class="vft-error-title">${escapeHtml(title)}</span>` +
    `${body}${warnBody}` +
    `</div>`
  );
}

function renderWarning(warnings: string[]): string {
  if (warnings.length === 0) return '';
  const list = warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('');
  return (
    `<div class="vft-warning-block">` +
    `<strong class="vft-warning-title">Warning:</strong>` +
    `<ul class="vft-warning-list">${list}</ul>` +
    `</div>`
  );
}

// ─── Markdown-it plugin ─────────────────────────────────────────────
//
// **Data-First architecture**: ALL parsing, validation and file I/O
// happens here at build time. The Vue component receives only
// pre-computed data and never touches YAML, Zod or the filesystem.
//
// What happens where:
//   Build-time (this file):
//     • YAML / ASCII parsing
//     • Zod validation
//     • `from:` → fs scan
//     • `url:` (local) → fs.readFileSync
//     • Error / warning HTML rendering
//   Client-side (Vue component):
//     • Decode JSON from `data` prop → render tree (that's it!)

export const FolderTreeMarkdown = (md: any, pluginConfig: PluginConfig = {}) => {
  const languages = pluginConfig.languages || DEFAULT_LANGUAGES;
  const rootDir = pluginConfig.root || process.cwd();

  // Pre-build the icon-map attribute (same for every instance)
  const iconMapAttr =
    pluginConfig.iconMap && Object.keys(pluginConfig.iconMap).length
      ? ` :icon-map='${escapeAttr(JSON.stringify(pluginConfig.iconMap))}'`
      : '';

  const fence =
    md.renderer.rules.fence?.bind(md.renderer.rules) ||
    ((tokens: any, idx: any, options: any, _env: any, self: any) =>
      self.renderToken(tokens, idx, options));

  // ── Helper: build <VpFolderTree /> tag ──────────────────────────
  function buildTag(
    mainAttr: string,
    blockOptions: Record<string, boolean>,
  ): string {
    const opts = {
      defaultOpen: blockOptions.defaultOpen ?? (pluginConfig.defaultOpen !== false),
      showToolbar: blockOptions.showToolbar ?? (pluginConfig.showToolbar !== false),
      showBadges: blockOptions.showBadges ?? (pluginConfig.showBadges !== false),
      interactive: blockOptions.interactive ?? (pluginConfig.interactive !== false),
    };

    return (
      `<VpFolderTree ${mainAttr}` +
      ` :default-open="${opts.defaultOpen}"` +
      ` :show-toolbar="${opts.showToolbar}"` +
      ` :show-badges="${opts.showBadges}"` +
      ` :interactive="${opts.interactive}"` +
      `${iconMapAttr} />`
    );
  }

  function encodeData(tree: any[]): string {
    return `:data='${escapeAttr(JSON.stringify(tree))}'`;
  }

  // ── Fence renderer ─────────────────────────────────────────────
  md.renderer.rules.fence = (
    tokens: any,
    idx: number,
    options: any,
    _env: any,
    self: any,
  ) => {
    const token = tokens[idx];
    const lang = token.info.trim().toLowerCase();

    if (!languages.includes(lang)) {
      return fence(tokens, idx, options, _env, self);
    }

    const content = token.content.trim();

    // ── 1. Try YAML object format (url / from / options+tree) ────
    try {
      const parsed = YAML.parse(content);

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const blockOpts = extractBlockOptions(parsed);

        // 1a. `from:` → filesystem scan (sync)
        if (parsed.from) {
          try {
            const tree = processFsScan(parsed as any, rootDir);
            return buildTag(encodeData(tree), blockOpts);
          } catch (e: any) {
            return renderError('Folder Tree Error', [e.message]);
          }
        }

        // 1b. `url:` → build-time resolution (local files, HTTP, JS modules)
        if (parsed.url) {
          const result = resolveUrl(String(parsed.url), rootDir);
          if (result.type === 'data') {
            return buildTag(encodeData(result.data!), blockOpts);
          }
          return renderError('Folder Tree Error', [result.error!]);
        }
      }
    } catch {
      // YAML parse failed — fall through to ASCII / inline
    }

    // ── 2. ASCII tree ────────────────────────────────────────────
    if (isAsciiTree(content)) {
      try {
        const tree = parseAsciiTree(content);
        if (tree.length === 0) {
          return renderError('Folder Tree Error', [
            'Could not parse any nodes from the ASCII tree.',
          ]);
        }
        return buildTag(encodeData(tree), {});
      } catch (e: any) {
        return renderError('Folder Tree Error', [e.message || 'Unknown error']);
      }
    }

    // ── 3. Inline YAML ───────────────────────────────────────────
    // Single YAML.parse → validate → convert (no double parsing)
    let parsed: any;
    try {
      parsed = YAML.parse(content);
    } catch (e: any) {
      return renderError('YAML Syntax Error', [e.message || 'Unknown error']);
    }

    // Validate with Zod
    const validation = validateTreeData(parsed);
    if (!validation.valid) {
      return renderError(
        'Invalid Tree Configuration',
        validation.errors,
        validation.warnings,
      );
    }

    // Extract options & tree items
    const isObj = parsed && typeof parsed === 'object' && !Array.isArray(parsed);
    const blockOpts = isObj ? extractBlockOptions(parsed) : {};
    const items = isObj && Array.isArray(parsed.tree)
      ? parsed.tree
      : Array.isArray(parsed)
        ? parsed
        : [];

    const tree = convertItems(items);
    if (tree.length === 0) {
      return renderError('Folder Tree Error', [
        'Could not parse any nodes from the provided YAML.',
      ]);
    }

    const warningHtml = renderWarning(validation.warnings);
    return warningHtml + buildTag(encodeData(tree), blockOpts);
  };
};
