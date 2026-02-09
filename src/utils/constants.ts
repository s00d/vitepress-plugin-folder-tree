import type { StatusColorInfo } from './types';

// ─── Injection key ──────────────────────────────────────────────────

export const FOLDER_TREE_CTX_KEY = 'folderTreeCtx';

// ─── Status colors ──────────────────────────────────────────────────

export const STATUS_COLORS: Record<string, StatusColorInfo> = {
  added: {
    rowClass:   'vft-status-added',
    badgeClass: 'vft-status-badge-added',
    nameClass:  'vft-status-name-added',
    text: 'A',
  },
  removed: {
    rowClass:   'vft-status-removed',
    badgeClass: 'vft-status-badge-removed',
    nameClass:  'vft-status-name-removed',
    text: 'D',
  },
  modified: {
    rowClass:   'vft-status-modified',
    badgeClass: 'vft-status-badge-modified',
    nameClass:  'vft-status-name-modified',
    text: 'M',
  },
};

// ─── Layout constants ───────────────────────────────────────────────

export const INDENT_PX = 16;
export const GUIDE_OFFSET = 13;


