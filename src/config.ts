/**
 * A single node in the rendered folder tree (internal representation).
 */
export interface TreeNode {
  /** Display name */
  name: string;
  /** Whether this node is a directory */
  isFolder: boolean;
  /** Children nodes (only for folders) */
  children?: TreeNode[];
  /** Short description shown as a badge next to the name */
  description?: string;
  /** Right-aligned note/label at the end of the row */
  note?: string;
  /** Highlight this row visually */
  highlight?: boolean;
  /** Custom icon text (emoji or Iconify class) — overrides the default SVG */
  icon?: string;
  /** Whether the folder is initially expanded */
  open?: boolean;
  /** Lock this folder — prevent toggling by the user */
  locked?: boolean;
  /** URL link — clicking the name navigates to this URL */
  href?: string;
  /** Preview text shown in tooltip on hover */
  preview?: string;
  /** Diff status indicator ('deleted' is an alias for 'removed') */
  status?: 'added' | 'removed' | 'deleted' | 'modified';
  /** Tab name — root-level nodes with this field are grouped into switchable tabs */
  tab?: string;
}

// ── YAML input types (what the user writes) ─────────────────────────

/**
 * A single item in the YAML input.
 * - A plain **string** → file with that name
 * - An **object** → file or folder with metadata
 */
export type YamlInputItem = string | YamlInputObject;

export interface YamlInputObject {
  /** File or folder name (required unless `tab` is set) */
  name?: string;
  /**
   * Explicit type. If omitted the plugin auto-detects:
   * - has `children` → folder
   * - otherwise → file
   */
  type?: 'file' | 'folder';
  /** Nested children (makes this node a folder) */
  children?: YamlInputItem[];
  /** Short description badge (shown next to name) */
  description?: string;
  /** Right-aligned note/label at the end of the row */
  note?: string;
  /** Highlight the row */
  highlight?: boolean;
  /** Custom icon (emoji or Iconify class, e.g. "🔥") */
  icon?: string;
  /** Initial expanded state for folders */
  open?: boolean;
  /** Lock this folder — user cannot toggle it */
  locked?: boolean;
  /** URL link — clicking the name opens this URL */
  href?: string;
  /** Preview text shown in tooltip on hover */
  preview?: string;
  /** Diff status: 'added' | 'removed' | 'deleted' | 'modified' ('deleted' is alias for 'removed') */
  status?: 'added' | 'removed' | 'deleted' | 'modified';
  /** Tab name — root-level items with this field are grouped into switchable tabs */
  tab?: string;
}

/**
 * Plugin configuration for VitePress.
 */
export interface PluginConfig {
  /**
   * Code block language identifiers that trigger the tree rendering.
   * @default ['folder-tree', 'file-tree', 'tree']
   */
  languages?: string[];

  /**
   * Default expanded state for all folders.
   * Individual nodes can override with `open`.
   * @default true
   */
  defaultOpen?: boolean;

  /**
   * Show the Expand all / Collapse all toolbar.
   * @default true
   */
  showToolbar?: boolean;

  /**
   * Show auto-generated file/folder count badges on folders.
   * Manual `description` fields are always shown regardless.
   * @default true
   */
  showBadges?: boolean;

  /**
   * Allow interactive expand/collapse.
   * When false the tree is rendered as a static snapshot (no clicking).
   * Individual nodes can still use `locked` to lock selectively.
   * @default true
   */
  interactive?: boolean;

  /**
   * Root directory for resolving `from:` paths.
   * @default process.cwd()
   */
  root?: string;

  /**
   * Custom icon mapping: keys are full filenames or extensions.
   * Values are emoji or Iconify class names.
   * Example: { 'vite.config.ts': '⚡', 'ts': 'logos:typescript-icon' }
   */
  iconMap?: Record<string, string>;
}
