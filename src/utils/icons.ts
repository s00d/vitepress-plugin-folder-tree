// ─── File extension detection ───────────────────────────────────────

export function getExt(name: string): string {
  const lower = name.toLowerCase();
  if (lower === 'dockerfile' || lower.startsWith('docker-compose')) return 'dock';
  if (lower === 'makefile') return 'make';
  if (lower === 'license' || lower === 'licence') return 'lic';
  if (lower.startsWith('.git')) return 'git';
  if (lower.startsWith('.env')) return 'env';
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return '';
  return name.slice(dot + 1).toLowerCase();
}

/**
 * Check if an icon string is a CSS-class based icon (Iconify / utility class).
 */
export function isClassIcon(icon: string): boolean {
  return icon.includes(':') || icon.startsWith('i-') || icon.includes(' ');
}

/**
 * Resolve custom icon from iconMap by node name or extension.
 * Returns the icon string if found, otherwise null.
 */
export function resolveIconMap(
  nodeName: string,
  ext: string,
  iconMap: Record<string, string>,
): string | null {
  if (iconMap[nodeName]) return iconMap[nodeName];
  if (ext && iconMap[ext]) return iconMap[ext];
  return null;
}
