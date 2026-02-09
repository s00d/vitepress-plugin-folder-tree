import YAML from 'yaml';
import { validateTreeData } from '../utils/tree-validator';

// Re-export for public API
export type { ValidationResult } from '../utils/tree-validator';
export { validateTreeData } from '../utils/tree-validator';

/**
 * Validate a raw YAML string (parses YAML first, then validates).
 *
 * Used by server-side code and the public API.
 * Client-side code should use `validateTreeData()` directly with
 * already-parsed data to avoid static YAML import.
 */
export function validateTreeInput(raw: string) {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { valid: false, errors: ['Tree is empty — add at least one item.'], warnings: [] };
  }

  let parsed: unknown;
  try {
    parsed = YAML.parse(trimmed);
  } catch (e: any) {
    return { valid: false, errors: [`YAML syntax error: ${e.message ?? 'unknown'}`], warnings: [] };
  }

  return validateTreeData(parsed);
}
