import { z } from 'zod';

// ─── Types ───────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Zod schemas ─────────────────────────────────────────────────────
//
// Shape objects are extracted so that KNOWN_*_KEYS sets are derived
// from the schema — single source of truth, no manual sync needed.

const StatusEnum = z.enum(['added', 'removed', 'deleted', 'modified'], {
  message: 'Must be "added", "removed", "deleted", or "modified".',
});

const boolMsg = { message: 'Should be true or false.' };
const strMsg = { message: 'Should be a string.' };

/**
 * Non-recursive fields of a tree node.
 * `children` is added inside `z.lazy()` to break the circular reference.
 */
const nodeFields = {
  name: z.string(strMsg).min(1).nullish(),
  tab: z.string(strMsg).min(1).nullish(),
  type: z.enum(['file', 'folder'], { message: 'Must be "file" or "folder".' }).nullish(),
  description: z.string(strMsg).nullish(),
  note: z.string(strMsg).nullish(),
  highlight: z.boolean(boolMsg).nullish(),
  icon: z.string(strMsg).nullish(),
  open: z.boolean(boolMsg).nullish(),
  locked: z.boolean(boolMsg).nullish(),
  href: z.string(strMsg).nullish(),
  preview: z.string(strMsg).nullish(),
  status: StatusEnum.nullish(),
};

/** Options shape. */
const optionFields = {
  defaultOpen: z.boolean().nullish(),
  showToolbar: z.boolean().nullish(),
  showBadges: z.boolean().nullish(),
  interactive: z.boolean().nullish(),
};

// ─── Derived known-key sets (used for warning-level checks) ──────────

const KNOWN_NODE_KEYS = new Set([...Object.keys(nodeFields), 'children']);
const KNOWN_OPTION_KEYS = new Set(Object.keys(optionFields));

// ─── Composed schemas ────────────────────────────────────────────────

const NodeObjectSchema: z.ZodType<unknown> = z.lazy(() =>
  z
    .object({
      ...nodeFields,
      children: z.array(NodeSchema).nullish(),
    })
    .loose()
    .refine(data => !!(data.name || data.tab), {
      message: 'Missing or empty "name" field (or "tab" for tab nodes).',
    }),
);

const NodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.any().superRefine((val, ctx) => {
    if (typeof val === 'string') {
      if (!val.trim()) {
        ctx.addIssue({ code: 'custom', message: 'Empty string — every item needs a name.' });
      }
      return;
    }

    if (val === null || val === undefined) {
      ctx.addIssue({ code: 'custom', message: 'null/empty item.' });
      return;
    }
    if (typeof val !== 'object' || Array.isArray(val)) {
      ctx.addIssue({ code: 'custom', message: 'Must be a string or an object with "name".' });
      return;
    }

    const result = NodeObjectSchema.safeParse(val);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path });
      }
    }
  }),
);

const OptionsSchema = z.object(optionFields).loose();

const TreeConfigSchema = z.union([
  z.array(NodeSchema).min(1, 'Tree is empty — add at least one item.'),
  z.object({
    options: OptionsSchema.nullish(),
    tree: z.array(NodeSchema).min(1, 'Tree is empty — add at least one item.'),
  }),
]);

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Validate already-parsed data (no YAML dependency).
 *
 * 1. Zod schema validation (structure, types, required fields).
 * 2. Warning pass (unknown keys, `type="file"` with children).
 */
export function validateTreeData(parsed: unknown): ValidationResult {
  if (parsed === null || parsed === undefined) {
    return { valid: false, errors: ['Tree is empty — add at least one item.'], warnings: [] };
  }

  const zodResult = TreeConfigSchema.safeParse(parsed);

  if (!zodResult.success) {
    const errors = zodResult.error.issues.map(issue => {
      const path = issue.path.length ? issue.path.join('.') : 'root';
      return `${path}: ${issue.message}`;
    });
    return { valid: false, errors, warnings: [] };
  }

  const warnings: string[] = [];
  collectWarnings(zodResult.data, warnings);

  return { valid: true, errors: [], warnings };
}

// ─── Warning collection (post-validation) ────────────────────────────

function collectWarnings(data: unknown, warnings: string[]): void {
  let items: unknown[];

  if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === 'object' && 'tree' in data) {
    const obj = data as Record<string, unknown>;
    items = obj.tree as unknown[];

    if (obj.options && typeof obj.options === 'object') {
      for (const key of Object.keys(obj.options as Record<string, unknown>)) {
        if (!KNOWN_OPTION_KEYS.has(key)) {
          warnings.push(`options: unknown key "${key}" — known options: ${[...KNOWN_OPTION_KEYS].join(', ')}.`);
        }
      }
    }
  } else {
    return;
  }

  collectNodeWarnings(items, 'root', warnings);
}

function collectNodeWarnings(items: unknown[], path: string, warnings: string[]): void {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (typeof item !== 'object' || item === null) continue;

    const obj = item as Record<string, unknown>;
    const label = (obj.name || obj.tab || '') as string;
    const loc = `${path}[${i}]`;

    for (const key of Object.keys(obj)) {
      if (!KNOWN_NODE_KEYS.has(key)) {
        warnings.push(`${loc} ("${label}"): unknown key "${key}" — will be ignored.`);
      }
    }

    if (obj.type === 'file' && Array.isArray(obj.children) && obj.children.length > 0) {
      warnings.push(`${loc} ("${label}"): type is "file" but has "children" — will be treated as folder.`);
    }

    if (Array.isArray(obj.children)) {
      collectNodeWarnings(obj.children, `${loc}.children`, warnings);
    }
  }
}
