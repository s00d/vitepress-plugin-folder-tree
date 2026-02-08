<template>
  <div class="vp-folder-tree">
    <div class="vp-folder-tree__inner" ref="treeRef" tabindex="0" @keydown="handleKeydown" @mouseleave="clearHover">
    <!-- Toolbar -->
    <div v-if="showToolbar && interactive" class="vp-folder-tree__toolbar">
      <button class="vp-folder-tree__btn" @click="expandAll" title="Expand all">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="vp-folder-tree__btn" @click="collapseAll" title="Collapse all">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="vp-folder-tree__toolbar-sep"></span>
      <button class="vp-folder-tree__btn" @click="copyAsText" :title="copyLabel">
        <svg v-if="copyLabel === 'Copy'" viewBox="0 0 16 16" fill="none" width="14" height="14"><rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.3"/><path d="M3 11V3a1 1 0 011-1h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <svg v-else viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="vp-folder-tree__dropdown-wrap">
        <button class="vp-folder-tree__btn" @click="showDownloadMenu = !showDownloadMenu" title="Download">
          <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M8 2v8m0 0l-3-3m3 3l3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        </button>
        <div v-if="showDownloadMenu" class="vp-folder-tree__dropdown-menu">
          <button @click="downloadAs('txt')">.txt</button>
          <button @click="downloadAs('yaml')">.yaml</button>
          <button @click="downloadAs('json')">.json</button>
        </div>
      </div>
      <span class="vp-folder-tree__toolbar-sep"></span>
      <button class="vp-folder-tree__btn" @click="generateShellScript" :title="shellCopied ? 'Copied!' : 'Copy shell script'">
        <svg v-if="!shellCopied" viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M2 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 13h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <svg v-else viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="vp-folder-tree__search-wrap">
        <svg class="vp-folder-tree__search-icon" viewBox="0 0 16 16" fill="none" width="12" height="12"><circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.3"/><path d="M10 10l3.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <input
          v-model="searchQuery"
          class="vp-folder-tree__search"
          type="text"
          placeholder="Filter..."
          @input="onSearch"
        />
        <button v-if="searchQuery" class="vp-folder-tree__search-clear" @click="searchQuery = ''" title="Clear">&times;</button>
      </div>
    </div>
    <!-- Tabs -->
    <div v-if="tabs.length > 1" class="vp-folder-tree__tabs">
      <button
        v-for="t in tabs"
        :key="t"
        :class="['vp-folder-tree__tab', { 'is-active': activeTab === t }]"
        @click="currentTab = t"
      >{{ t }}</button>
    </div>
    <!-- Loading -->
    <div v-if="loading" class="vp-folder-tree__loading">Loading tree…</div>
    <!-- Error -->
    <div v-else-if="error" class="vp-folder-tree__error">{{ error }}</div>
    <!-- Tree -->
    <ul v-else class="vp-folder-tree__list" role="tree">
      <li v-for="(node, i) in currentTreeData" :key="activeTab + '-' + i" v-show="isNodeVisible(node)">
        <FolderNode
          :node="node"
          :depth="0"
          :path="node.name"
          :expanded-map="expandedMap"
          :interactive="interactive"
          :show-badges="showBadges"
          :search="searchQueryLower"
          :parent-matched="false"
          @toggle="onToggle"
        />
      </li>
    </ul>
    <!-- No results -->
    <div v-if="!loading && searchQuery && !hasVisibleNodes" class="vp-folder-tree__empty">No matches found</div>
    <!-- Stats footer -->
    <div v-if="!loading && !error && currentTreeData.length" class="vp-folder-tree__footer">
      <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M3 6a2 2 0 012-2h4.172a2 2 0 011.414.586L12 6h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" fill="currentColor" opacity="0.35"/></svg>
      {{ totalStats.folders }} {{ totalStats.folders === 1 ? 'folder' : 'folders' }}
      <span class="vp-folder-tree__footer-dot">&middot;</span>
      <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="currentColor" opacity="0.35"/><path d="M14 2v6h6" stroke="currentColor" opacity="0.35" stroke-width="1"/></svg>
      {{ totalStats.files }} {{ totalStats.files === 1 ? 'file' : 'files' }}
    </div>
    <!-- Context menu -->
    <div v-if="ctxMenu.visible" class="vp-folder-tree__ctx" :style="{ top: ctxMenu.y + 'px', left: ctxMenu.x + 'px' }" @click.stop>
      <div class="vp-folder-tree__ctx-item" @click="copyCtx('name')">Copy Name</div>
      <div class="vp-folder-tree__ctx-item" @click="copyCtx('path')">Copy Path</div>
    </div>
    <!-- Preview tooltip -->
    <div v-if="tooltip.visible" class="vp-folder-tree__tooltip" :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
      <pre>{{ tooltip.text }}</pre>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, onMounted, onUnmounted, watch, defineComponent, h, nextTick } from 'vue';
import { withBase } from 'vitepress';
import YAML from 'yaml';

const props = defineProps({
  data: { type: String, default: '' },
  configUrl: { type: String, default: '' },
  defaultOpen: { type: Boolean, default: true },
  showToolbar: { type: Boolean, default: true },
  showBadges: { type: Boolean, default: true },
  interactive: { type: Boolean, default: true },
  iconMap: { type: String, default: '' },
});

const treeRef = ref(null);
const error = ref('');
const loading = ref(false);
const searchQuery = ref('');
const searchQueryLower = computed(() => searchQuery.value.toLowerCase());
const copyLabel = ref('Copy');
const showDownloadMenu = ref(false);
const shellCopied = ref(false);

// ─── Icon map ────────────────────────────────────────────────────────
const parsedIconMap = computed(() => {
  if (!props.iconMap) return {};
  try { return JSON.parse(decodeURIComponent(props.iconMap)); }
  catch { return {}; }
});

// ─── Context menu ────────────────────────────────────────────────────
const ctxMenu = reactive({ visible: false, x: 0, y: 0, path: '', name: '' });

function closeCtx() { ctxMenu.visible = false; }

function onNodeContextMenu(e, node, path) {
  e.preventDefault();
  e.stopPropagation();
  ctxMenu.visible = true;
  ctxMenu.x = e.clientX;
  ctxMenu.y = e.clientY;
  ctxMenu.path = path;
  ctxMenu.name = node.name;
}

function copyCtx(type) {
  let text = '';
  if (type === 'name') text = ctxMenu.name;
  else if (type === 'path') text = ctxMenu.path;
  navigator.clipboard.writeText(text);
  closeCtx();
}

// ─── Preview tooltip ─────────────────────────────────────────────────
const tooltip = reactive({ visible: false, text: '', x: 0, y: 0 });
let hoverTimer = null;

function onNodeTooltipEnter(e, node) {
  if (!node.preview) return;
  hoverTimer = setTimeout(() => {
    tooltip.text = node.preview;
    tooltip.x = e.clientX + 15;
    tooltip.y = e.clientY + 10;
    tooltip.visible = true;
  }, 600);
}

function onNodeTooltipLeave() {
  clearTimeout(hoverTimer);
  tooltip.visible = false;
}

// ─── Deep linking ────────────────────────────────────────────────────
const focusedPath = ref('');

function hasPathInNodes(nodes, targetPath, prefix) {
  for (const n of nodes) {
    const p = prefix ? prefix + '/' + n.name : n.name;
    if (p === targetPath) return true;
    if (n.children && targetPath.startsWith(p + '/')) {
      if (hasPathInNodes(n.children, targetPath, p)) return true;
    }
  }
  return false;
}

function handleHashChange() {
  const raw = window.location.hash.slice(1);
  if (!raw) return;
  const hash = decodeURIComponent(raw);

  // Check if path exists in our tree (avoid conflict with heading anchors)
  let found = false;

  if (tabs.value.length > 0) {
    for (const tab of tabs.value) {
      const tabNodes = treeData.value.filter(n => n.tab === tab);
      const children = tabNodes.flatMap(n => n.children || []);
      if (hasPathInNodes(children, hash, '')) {
        currentTab.value = tab;
        found = true;
        break;
      }
    }
  } else {
    found = hasPathInNodes(treeData.value, hash, '');
  }

  if (!found) return;

  // Expand all ancestors
  const parts = hash.split('/');
  let current = '';
  for (let i = 0; i < parts.length; i++) {
    current = current ? current + '/' + parts[i] : parts[i];
    expandedMap[current] = true;
  }

  focusedPath.value = hash;

  nextTick(() => {
    setTimeout(() => {
      if (!treeRef.value) return;
      const rows = treeRef.value.querySelectorAll('.vp-folder-tree__row');
      const el = [...rows].find(r => r.dataset.path === hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  });

  setTimeout(() => { focusedPath.value = ''; }, 3000);
}

// ─── URL-loaded data ─────────────────────────────────────────────────
const urlData = ref([]);

async function loadConfigFromUrl(url) {
  const resolvedUrl = url.startsWith('http') ? url : withBase(url);

  if (url.endsWith('.js') || url.endsWith('.mjs')) {
    const absoluteUrl = resolvedUrl.startsWith('http')
      ? resolvedUrl
      : new URL(resolvedUrl, window.location.origin).href;
    const mod = await import(/* @vite-ignore */ absoluteUrl);
    let config = mod.default || mod.config || mod;
    if (typeof config === 'function') config = await config();
    return config;
  }

  const res = await fetch(resolvedUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();
  try { return YAML.parse(text.trim()); }
  catch { return JSON.parse(text); }
}

async function fetchTreeFromUrl(url) {
  loading.value = true;
  error.value = '';
  try {
    const parsed = await loadConfigFromUrl(url);
    let items;
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && typeof parsed === 'object') {
      items = Array.isArray(parsed.tree) ? parsed.tree : [parsed];
    } else {
      throw new Error('External file must export an array or object with "tree" array');
    }
    urlData.value = convertYamlItems(items);
  } catch (e) {
    error.value = `Failed to load tree: ${e.message || e}`;
    urlData.value = [];
  } finally {
    loading.value = false;
  }
}

function convertYamlItems(items) {
  const result = [];
  for (const item of items) {
    if (item === null || item === undefined) continue;
    if (typeof item === 'string') {
      const name = item.trim();
      if (name) result.push({ name, isFolder: false });
      continue;
    }
    if (typeof item !== 'object') continue;
    const obj = item;
    const name = obj.name || obj.tab || '';
    if (!name) continue;
    const hasChildren = Array.isArray(obj.children) && obj.children.length > 0;
    const isFolder = obj.type === 'folder' || hasChildren;
    const node = { name, isFolder };
    if (isFolder) node.children = hasChildren ? convertYamlItems(obj.children) : [];
    if (obj.description) node.description = obj.description;
    if (obj.note) node.note = obj.note;
    if (obj.highlight) node.highlight = true;
    if (obj.icon) node.icon = obj.icon;
    if (obj.open !== undefined) node.open = obj.open;
    if (obj.locked) node.locked = true;
    if (obj.href) node.href = obj.href;
    if (obj.status) node.status = obj.status === 'deleted' ? 'removed' : obj.status;
    if (obj.preview) node.preview = obj.preview;
    if (obj.tab) node.tab = obj.tab;
    result.push(node);
  }
  return result;
}

// ─── Tree data source ────────────────────────────────────────────────

const treeData = computed(() => {
  if (props.configUrl) return urlData.value;
  if (!props.data) {
    error.value = 'No tree data provided';
    return [];
  }
  try {
    const parsed = JSON.parse(decodeURIComponent(props.data));
    if (!Array.isArray(parsed) || parsed.length === 0) {
      error.value = 'Empty tree data';
      return [];
    }
    error.value = '';
    return parsed;
  } catch {
    error.value = 'Failed to parse tree data';
    return [];
  }
});

// ─── Tabs ────────────────────────────────────────────────────────────

const tabs = computed(() => {
  const data = treeData.value;
  if (!data.length) return [];
  const tabNames = data.filter(n => n.tab).map(n => n.tab);
  return [...new Set(tabNames)];
});

const currentTab = ref('');

const activeTab = computed(() => currentTab.value || (tabs.value.length > 0 ? tabs.value[0] : ''));

const currentTreeData = computed(() => {
  if (tabs.value.length === 0) return treeData.value;
  const tab = activeTab.value;
  const tabNodes = treeData.value.filter(n => n.tab === tab);
  return tabNodes.flatMap(n => n.children || []);
});

// All nodes across all tabs (for expand state init)
const allTreeNodes = computed(() => {
  if (tabs.value.length === 0) return treeData.value;
  return treeData.value.flatMap(n => n.tab ? (n.children || []) : [n]);
});

// ─── Statistics ──────────────────────────────────────────────────────

const totalStats = computed(() => {
  let files = 0, folders = 0;
  const count = (nodes) => {
    for (const n of nodes) {
      if (n.isFolder) { folders++; if (n.children) count(n.children); }
      else files++;
    }
  };
  count(currentTreeData.value);
  return { files, folders };
});

// ─── Search helpers ──────────────────────────────────────────────────

function nodeSelfMatches(node, query) {
  if (!query) return true;
  if (node.name.toLowerCase().includes(query)) return true;
  if (node.description && node.description.toLowerCase().includes(query)) return true;
  if (node.note && node.note.toLowerCase().includes(query)) return true;
  return false;
}

function nodeTreeMatches(node, query) {
  if (!query) return true;
  if (nodeSelfMatches(node, query)) return true;
  if (node.children) return node.children.some(c => nodeTreeMatches(c, query));
  return false;
}

function isNodeVisible(node) {
  return nodeTreeMatches(node, searchQueryLower.value);
}

const hasVisibleNodes = computed(() => {
  if (!searchQuery.value) return true;
  return currentTreeData.value.some(n => nodeTreeMatches(n, searchQueryLower.value));
});

function onSearch() {
  if (searchQuery.value) {
    const expandMatching = (nodes, prefix) => {
      for (const n of nodes) {
        if (!n.isFolder) continue;
        const p = prefix ? prefix + '/' + n.name : n.name;
        if (nodeTreeMatches(n, searchQueryLower.value)) expandedMap[p] = true;
        if (n.children) expandMatching(n.children, p);
      }
    };
    expandMatching(currentTreeData.value, '');
  }
}

// ─── Copy as text ────────────────────────────────────────────────────

function treeToText(nodes, prefix) {
  const lines = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const last = i === nodes.length - 1;
    const connector = last ? '└── ' : '├── ';
    lines.push(prefix + connector + node.name);
    if (node.isFolder && node.children && node.children.length > 0) {
      const childPrefix = prefix + (last ? '    ' : '│   ');
      lines.push(...treeToText(node.children, childPrefix));
    }
  }
  return lines;
}

function copyAsText() {
  const lines = treeToText(currentTreeData.value, '');
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    copyLabel.value = 'Copied!';
    setTimeout(() => { copyLabel.value = 'Copy'; }, 1500);
  }).catch(() => {
    copyLabel.value = 'Error';
    setTimeout(() => { copyLabel.value = 'Copy'; }, 1500);
  });
}

// ─── Shell script generation ─────────────────────────────────────────

function generateShellScript() {
  const commands = [];

  function traverse(nodes, currentPath) {
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
  const script = commands.join('\n');

  navigator.clipboard.writeText(script).then(() => {
    shellCopied.value = true;
    setTimeout(() => { shellCopied.value = false; }, 1500);
  }).catch(() => {
    shellCopied.value = false;
  });
}

// ─── Download ────────────────────────────────────────────────────────

function nodesToExportFormat(nodes) {
  return nodes.map(n => {
    if (!n.isFolder && !n.description && !n.note && !n.highlight && !n.icon && !n.href && !n.status && !n.preview) {
      return n.name;
    }
    const obj = { name: n.name };
    if (n.isFolder) {
      if (n.children && n.children.length) obj.children = nodesToExportFormat(n.children);
      else obj.type = 'folder';
    }
    if (n.description) obj.description = n.description;
    if (n.note) obj.note = n.note;
    if (n.highlight) obj.highlight = true;
    if (n.icon) obj.icon = n.icon;
    if (n.href) obj.href = n.href;
    if (n.status) obj.status = n.status;
    if (n.preview) obj.preview = n.preview;
    return obj;
  });
}

function downloadAs(format) {
  showDownloadMenu.value = false;
  let content, mimeType, ext;
  if (format === 'txt') {
    content = treeToText(currentTreeData.value, '').join('\n');
    mimeType = 'text/plain';
    ext = 'txt';
  } else if (format === 'yaml') {
    content = YAML.stringify(nodesToExportFormat(currentTreeData.value));
    mimeType = 'text/yaml';
    ext = 'yaml';
  } else {
    content = JSON.stringify(nodesToExportFormat(currentTreeData.value), null, 2);
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

// ─── Keyboard navigation ────────────────────────────────────────────

function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (ctxMenu.visible) { closeCtx(); e.preventDefault(); return; }
    if (tooltip.visible) { onNodeTooltipLeave(); e.preventDefault(); return; }
  }

  // Shift+F10 — open context menu for focused row (standard a11y shortcut)
  if (e.key === 'F10' && e.shiftKey) {
    e.preventDefault();
    const active = document.activeElement;
    if (active && active.classList.contains('vp-folder-tree__row') && active.dataset.path) {
      const path = active.dataset.path;
      const name = path.split('/').pop() || path;
      const rect = active.getBoundingClientRect();
      ctxMenu.visible = true;
      ctxMenu.x = rect.left + rect.width / 2;
      ctxMenu.y = rect.top + rect.height;
      ctxMenu.path = path;
      ctxMenu.name = name;
    }
    return;
  }

  if (!props.interactive || !treeRef.value) return;
  if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

  const rows = [...treeRef.value.querySelectorAll('.vp-folder-tree__row')]
    .filter(r => r.offsetHeight > 0);
  if (!rows.length) return;

  const active = document.activeElement;
  const idx = rows.indexOf(active);

  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault();
      const next = idx < rows.length - 1 ? idx + 1 : 0;
      rows[next].focus();
      break;
    }
    case 'ArrowUp': {
      e.preventDefault();
      const prev = idx > 0 ? idx - 1 : rows.length - 1;
      rows[prev].focus();
      break;
    }
    case 'ArrowRight': {
      if (idx >= 0) {
        const path = rows[idx].dataset?.path;
        if (path && expandedMap[path] === false && !lockedSet.has(path)) {
          expandedMap[path] = true;
          e.preventDefault();
        }
      }
      break;
    }
    case 'ArrowLeft': {
      if (idx >= 0) {
        const path = rows[idx].dataset?.path;
        if (path && expandedMap[path] === true && !lockedSet.has(path)) {
          expandedMap[path] = false;
          e.preventDefault();
        }
      }
      break;
    }
  }
}

// ─── Hover branch highlight ──────────────────────────────────────────

function handleHoverBranch(path) {
  if (!treeRef.value) return;
  const rows = treeRef.value.querySelectorAll('.vp-folder-tree__row');
  rows.forEach(row => {
    if (path && row.dataset.path && path !== row.dataset.path && path.startsWith(row.dataset.path + '/')) {
      row.classList.add('vp-folder-tree__row--on-branch');
    } else {
      row.classList.remove('vp-folder-tree__row--on-branch');
    }
  });
}

function clearHover() {
  if (!treeRef.value) return;
  treeRef.value.querySelectorAll('.vp-folder-tree__row--on-branch').forEach(el => {
    el.classList.remove('vp-folder-tree__row--on-branch');
  });
  onNodeTooltipLeave();
}

// ─── Expand / collapse state ────────────────────────────────────────
const expandedMap = reactive({});
const lockedSet = reactive(new Set());

function collectFolderInfo(nodes, prefix, result) {
  for (const n of nodes) {
    if (!n.isFolder) continue;
    const p = prefix ? prefix + '/' + n.name : n.name;
    const isOpen = n.open !== undefined ? n.open : props.defaultOpen;
    result.push({ path: p, open: isOpen, locked: !!n.locked });
    if (n.children) collectFolderInfo(n.children, p, result);
  }
}

function initExpand() {
  const entries = [];
  collectFolderInfo(allTreeNodes.value, '', entries);
  for (const e of entries) {
    if (expandedMap[e.path] === undefined) expandedMap[e.path] = e.open;
    if (e.locked) lockedSet.add(e.path);
  }
}

// ─── Click outside ───────────────────────────────────────────────────

function onClickOutside(e) {
  if (showDownloadMenu.value && treeRef.value) {
    const wrap = treeRef.value.querySelector('.vp-folder-tree__dropdown-wrap');
    if (wrap && !wrap.contains(e.target)) showDownloadMenu.value = false;
  }
  if (ctxMenu.visible && treeRef.value) {
    const ctxEl = treeRef.value.querySelector('.vp-folder-tree__ctx');
    if (!ctxEl || !ctxEl.contains(e.target)) closeCtx();
  }
}

function onResize() {
  if (ctxMenu.visible) closeCtx();
  if (tooltip.visible) onNodeTooltipLeave();
}

let initialized = false;

function activate() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', onClickOutside);
  window.addEventListener('hashchange', handleHashChange);
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onResize, true);

  if (props.configUrl) {
    fetchTreeFromUrl(props.configUrl).then(() => {
      initExpand();
      if (window.location.hash) handleHashChange();
    });
  } else {
    initExpand();
    if (window.location.hash) handleHashChange();
  }
}

onMounted(() => {
  activate();
});

onUnmounted(() => {
  if (initialized) {
    document.removeEventListener('click', onClickOutside);
    window.removeEventListener('hashchange', handleHashChange);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onResize, true);
  }
  clearTimeout(hoverTimer);
});

watch(() => props.configUrl, (url) => {
  if (url) fetchTreeFromUrl(url).then(initExpand);
});
watch(treeData, initExpand);

function onToggle(path) {
  if (!props.interactive) return;
  if (lockedSet.has(path)) return;
  expandedMap[path] = !expandedMap[path];
}

function expandAll() {
  if (!props.interactive) return;
  const entries = [];
  collectFolderInfo(currentTreeData.value, '', entries);
  for (const e of entries) {
    if (!lockedSet.has(e.path)) expandedMap[e.path] = true;
  }
}

function collapseAll() {
  if (!props.interactive) return;
  const entries = [];
  collectFolderInfo(currentTreeData.value, '', entries);
  for (const e of entries) {
    if (!lockedSet.has(e.path)) expandedMap[e.path] = false;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function getExt(name) {
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

const FILE_COLORS = {
  js:  { bg: '#fcf4a1', stroke: '#d4a72c', text: '#8b6914' },
  mjs: { bg: '#fcf4a1', stroke: '#d4a72c', text: '#8b6914' },
  cjs: { bg: '#fcf4a1', stroke: '#d4a72c', text: '#8b6914' },
  jsx: { bg: '#fcf4a1', stroke: '#d4a72c', text: '#8b6914' },
  ts:  { bg: '#c7e1ff', stroke: '#4a8ed4', text: '#1a5490' },
  mts: { bg: '#c7e1ff', stroke: '#4a8ed4', text: '#1a5490' },
  cts: { bg: '#c7e1ff', stroke: '#4a8ed4', text: '#1a5490' },
  tsx: { bg: '#c7e1ff', stroke: '#4a8ed4', text: '#1a5490' },
  vue: { bg: '#c8f7d5', stroke: '#42b883', text: '#256d4b' },
  svelte:{ bg: '#ffddc7', stroke: '#e3622b', text: '#a33e12' },
  json:{ bg: '#e1e1e1', stroke: '#999',    text: '#555' },
  yaml:{ bg: '#e1e1e1', stroke: '#999',    text: '#555' },
  yml: { bg: '#e1e1e1', stroke: '#999',    text: '#555' },
  toml:{ bg: '#e1e1e1', stroke: '#999',    text: '#555' },
  xml: { bg: '#e1e1e1', stroke: '#999',    text: '#555' },
  md:  { bg: '#d3e8fd', stroke: '#6ea8de', text: '#2a6aaa' },
  mdx: { bg: '#d3e8fd', stroke: '#6ea8de', text: '#2a6aaa' },
  html:{ bg: '#ffd6c7', stroke: '#e06030', text: '#993311' },
  css: { bg: '#c7d4ff', stroke: '#4466dd', text: '#223399' },
  scss:{ bg: '#f0c7e8', stroke: '#c66da9', text: '#884488' },
  sass:{ bg: '#f0c7e8', stroke: '#c66da9', text: '#884488' },
  less:{ bg: '#c7d4ff', stroke: '#4466dd', text: '#223399' },
  py:  { bg: '#d6ecf7', stroke: '#4b8bbe', text: '#2b5f82' },
  rb:  { bg: '#fcc7c7', stroke: '#cc3333', text: '#8b1a1a' },
  go:  { bg: '#c7ecf7', stroke: '#00add8', text: '#007090' },
  rs:  { bg: '#fdd8c7', stroke: '#de5623', text: '#993311' },
  java:{ bg: '#fdd8c7', stroke: '#e06030', text: '#993311' },
  kt:  { bg: '#d8c7fd', stroke: '#7f52ff', text: '#4a2db3' },
  swift:{ bg: '#fdd0c7', stroke: '#f05138', text: '#a02010' },
  c:   { bg: '#c7d4ff', stroke: '#555ea3', text: '#333d80' },
  cpp: { bg: '#c7d4ff', stroke: '#555ea3', text: '#333d80' },
  h:   { bg: '#c7d4ff', stroke: '#555ea3', text: '#333d80' },
  cs:  { bg: '#d8c7fd', stroke: '#6a26cd', text: '#4a1a8e' },
  php: { bg: '#d0c7f7', stroke: '#7b7fb5', text: '#4f5399' },
  sh:  { bg: '#d5d5d5', stroke: '#666',    text: '#333' },
  bash:{ bg: '#d5d5d5', stroke: '#666',    text: '#333' },
  zsh: { bg: '#d5d5d5', stroke: '#666',    text: '#333' },
  sql: { bg: '#d6ecf7', stroke: '#4b8bbe', text: '#2b5f82' },
  graphql:{ bg: '#f0c7e8', stroke: '#e535ab', text: '#a3207a' },
  gql: { bg: '#f0c7e8', stroke: '#e535ab', text: '#a3207a' },
  lock:{ bg: '#e1e1e1', stroke: '#999',    text: '#555' },
  env: { bg: '#fcf4a1', stroke: '#d4a72c', text: '#8b6914' },
  txt: { bg: '#f0f0f0', stroke: '#bbb',    text: '#666' },
  png: { bg: '#d6f7dc', stroke: '#5cb85c', text: '#337733' },
  jpg: { bg: '#d6f7dc', stroke: '#5cb85c', text: '#337733' },
  jpeg:{ bg: '#d6f7dc', stroke: '#5cb85c', text: '#337733' },
  gif: { bg: '#d6f7dc', stroke: '#5cb85c', text: '#337733' },
  svg: { bg: '#fdd8c7', stroke: '#e06030', text: '#993311' },
  webp:{ bg: '#d6f7dc', stroke: '#5cb85c', text: '#337733' },
  ico: { bg: '#d6f7dc', stroke: '#5cb85c', text: '#337733' },
  woff:{ bg: '#e1e1e1', stroke: '#999',    text: '#555' },
  woff2:{ bg: '#e1e1e1', stroke: '#999',    text: '#555' },
  ttf: { bg: '#e1e1e1', stroke: '#999',    text: '#555' },
  dock:{ bg: '#c7e1ff', stroke: '#4a8ed4', text: '#1a5490' },
  make:{ bg: '#d5d5d5', stroke: '#666',    text: '#333' },
  lic: { bg: '#e1e1e1', stroke: '#999',    text: '#555' },
  git: { bg: '#fdd8c7', stroke: '#e06030', text: '#993311' },
};

function getFileColors(ext) {
  return FILE_COLORS[ext] || { bg: '#f0f0f0', stroke: '#bbb', text: '#666' };
}

function countChildren(node) {
  if (!node.children) return null;
  let files = 0, folders = 0;
  for (const c of node.children) { if (c.isFolder) folders++; else files++; }
  return { files, folders };
}

// ─── Status colors ──────────────────────────────────────────────────

const STATUS_COLORS = {
  added:    { bg: 'rgba(34,197,94,0.06)', border: '#22c55e', badge: '#16a34a', text: 'A', nameColor: '#16a34a' },
  removed:  { bg: 'rgba(239,68,68,0.06)', border: '#ef4444', badge: '#dc2626', text: 'D', nameColor: '#dc2626' },
  modified: { bg: 'rgba(245,158,11,0.06)', border: '#f59e0b', badge: '#d97706', text: 'M', nameColor: '#d97706' },
};

// ─── SVG builders ───────────────────────────────────────────────────

const S_ICON = 'display:inline-block;flex-shrink:0;width:16px;height:16px;margin:0 3px;vertical-align:middle';

function buildChevron(isOpen, isLocked, isInteractive) {
  const canToggle = isInteractive && !isLocked;
  const opacity = canToggle ? '0.6' : '0.25';
  return h('svg', {
    style: `display:inline-block;flex-shrink:0;width:14px;height:14px;transition:transform .15s ease;transform:rotate(${isOpen ? '90' : '0'}deg);color:var(--vp-c-text-3,#8e8e93);vertical-align:middle;opacity:${opacity}`,
    viewBox: '0 0 16 16', fill: 'none',
  }, [
    h('path', { d: 'M6 4l4 4-4 4', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  ]);
}

function buildFolderIcon(isOpen) {
  const fc = isOpen ? '#e8a93a' : '#d4952a';
  const sc = '#b8862a';
  if (isOpen) {
    return h('svg', { style: S_ICON, viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', { d: 'M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2h-5.172a2 2 0 01-1.414-.586L11 4H5a2 2 0 00-2 2v11a2 2 0 002 2z', fill: fc, stroke: sc, 'stroke-width': '1' }),
      h('path', { d: 'M3 13h18l-2.4 6H5.4L3 13z', fill: '#f0c050', stroke: sc, 'stroke-width': '1' }),
    ]);
  }
  return h('svg', { style: S_ICON, viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M3 6a2 2 0 012-2h4.172a2 2 0 011.414.586L12 6h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z', fill: fc, stroke: sc, 'stroke-width': '1' }),
  ]);
}

function buildFileIcon(ext) {
  const c = getFileColors(ext);
  const label = ext
    ? h('text', { x: '12', y: '17', 'text-anchor': 'middle', 'font-size': ext.length > 3 ? '5' : '6', 'font-weight': '700', 'font-family': 'system-ui,sans-serif', fill: c.text }, ext.toUpperCase())
    : null;
  return h('svg', { style: S_ICON, viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z', fill: c.bg, stroke: c.stroke, 'stroke-width': '1' }),
    h('path', { d: 'M14 2v6h6', stroke: c.stroke, 'stroke-width': '1', 'stroke-linejoin': 'round' }),
    label,
  ]);
}

function buildCustomIcon(icon) {
  if (icon.includes(':') || icon.startsWith('i-') || icon.includes(' ')) {
    return h('span', {
      class: icon,
      style: 'display:inline-block;flex-shrink:0;width:16px;height:16px;margin:0 3px;vertical-align:middle',
    });
  }
  return h('span', {
    style: 'display:inline-flex;flex-shrink:0;width:16px;height:16px;margin:0 3px;align-items:center;justify-content:center;font-size:13px;line-height:1;vertical-align:middle',
  }, icon);
}

function getFileIconRender(node, ext) {
  const iconMap = parsedIconMap.value;
  if (iconMap[node.name]) return buildCustomIcon(iconMap[node.name]);
  if (ext && iconMap[ext]) return buildCustomIcon(iconMap[ext]);
  return buildFileIcon(ext);
}

function buildLockIcon() {
  return h('svg', {
    style: 'display:inline-block;flex-shrink:0;width:11px;height:11px;margin-left:4px;vertical-align:middle;color:var(--vp-c-text-3,#8e8e93);opacity:0.45',
    viewBox: '0 0 16 16', fill: 'none',
  }, [
    h('rect', { x: '3', y: '7', width: '10', height: '7', rx: '1.5', stroke: 'currentColor', 'stroke-width': '1.3', fill: 'none' }),
    h('path', { d: 'M5.5 7V5a2.5 2.5 0 015 0v2', stroke: 'currentColor', 'stroke-width': '1.3', 'stroke-linecap': 'round' }),
  ]);
}

// ─── Style constants ─────────────────────────────────────────────────
const S_BADGE = 'margin-left:6px;padding:0 6px;border-radius:10px;background:var(--vp-c-bg-soft,#f6f6f7);color:var(--vp-c-text-3,#8e8e93);font-size:10px;white-space:nowrap;flex-shrink:0;height:16px;line-height:16px';
const S_NOTE = 'margin-left:auto;padding-left:8px;padding-right:8px;color:var(--vp-c-text-3,#8e8e93);font-size:11px;white-space:nowrap;flex-shrink:0;opacity:0.7';
const S_LINK = 'color:var(--vp-c-brand-1,#3451b2);text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';

// ─── Recursive render component ─────────────────────────────────────

const INDENT_PX = 16;
const GUIDE_OFFSET = 13;

const FolderNode = defineComponent({
  name: 'FolderNode',
  props: {
    node: { type: Object, required: true },
    depth: { type: Number, default: 0 },
    path: { type: String, required: true },
    expandedMap: { type: Object, required: true },
    interactive: { type: Boolean, default: true },
    showBadges: { type: Boolean, default: true },
    search: { type: String, default: '' },
    parentMatched: { type: Boolean, default: false },
  },
  emits: ['toggle'],
  setup(nodeProps, { emit }) {
    return () => {
      const { node, depth, path, expandedMap, interactive, showBadges, search, parentMatched } = nodeProps;

      if (search && !parentMatched && !nodeTreeMatches(node, search)) {
        return null;
      }

      const isOpen = !!expandedMap[path];
      const children = node.children || [];
      const hasChildren = children.length > 0;
      const ext = node.isFolder ? '' : getExt(node.name);
      const stats = node.isFolder ? countChildren(node) : null;
      const isLocked = !!node.locked;
      const canToggle = interactive && !isLocked && node.isFolder;
      const isFocused = path === focusedPath.value;

      const els = [];

      if (depth > 0) {
        els.push(h('span', {
          style: `display:inline-block;width:${depth * INDENT_PX}px;flex-shrink:0;position:relative`,
        }));
      }

      if (node.isFolder) {
        els.push(buildChevron(isOpen, isLocked, interactive));
      } else {
        els.push(h('span', { style: 'display:inline-block;width:14px;height:14px;flex-shrink:0' }));
      }

      if (node.icon) {
        els.push(buildCustomIcon(node.icon));
      } else if (node.isFolder) {
        els.push(buildFolderIcon(isOpen));
      } else {
        els.push(getFileIconRender(node, ext));
      }

      if (node.status && STATUS_COLORS[node.status]) {
        const sc = STATUS_COLORS[node.status];
        els.push(h('span', {
          style: `display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:3px;background:${sc.badge};color:#fff;font-size:9px;font-weight:600;flex-shrink:0;margin-right:2px;line-height:1`,
        }, sc.text));
      }

      const statusInfo = node.status ? STATUS_COLORS[node.status] : null;
      let nameStyle = node.isFolder
        ? 'font-weight:600;color:var(--vp-c-text-1,#213547)'
        : 'color:var(--vp-c-text-2,#595959)';
      if (statusInfo) {
        nameStyle = (node.isFolder ? 'font-weight:600;' : '') + `color:${statusInfo.nameColor}`;
      }
      const nameDecoStyle = node.status === 'removed' ? 'text-decoration:line-through;opacity:0.6;' : '';

      if (node.href) {
        els.push(
          h('a', {
            href: node.href,
            style: `${S_LINK};${node.isFolder ? 'font-weight:600' : ''};${nameDecoStyle}`,
            onClick: (e) => e.stopPropagation(),
          }, node.name)
        );
      } else {
        if (search && node.name.toLowerCase().includes(search)) {
          const idx = node.name.toLowerCase().indexOf(search);
          const before = node.name.slice(0, idx);
          const match = node.name.slice(idx, idx + search.length);
          const after = node.name.slice(idx + search.length);
          els.push(
            h('span', { style: `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${nameStyle};${nameDecoStyle}` }, [
              before,
              h('mark', { style: 'background:var(--vp-c-brand-soft,rgba(100,108,255,0.14));color:inherit;border-radius:2px;padding:0 1px' }, match),
              after,
            ])
          );
        } else {
          els.push(
            h('span', { style: `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${nameStyle};${nameDecoStyle}` }, node.name)
          );
        }
      }

      if (isLocked) {
        els.push(buildLockIcon());
      }

      if (node.description) {
        els.push(h('span', { style: S_BADGE }, node.description));
      } else if (showBadges && node.isFolder && stats) {
        const parts = [];
        if (stats.folders > 0) parts.push(stats.folders + ' folder' + (stats.folders > 1 ? 's' : ''));
        if (stats.files > 0) parts.push(stats.files + ' file' + (stats.files > 1 ? 's' : ''));
        if (parts.length) {
          els.push(h('span', { style: S_BADGE }, parts.join(', ')));
        }
      }

      if (node.note) {
        els.push(h('span', { style: S_NOTE }, node.note));
      }

      let rowExtraStyle = canToggle ? 'cursor:pointer;' : '';

      if (node.status && STATUS_COLORS[node.status]) {
        const sc = STATUS_COLORS[node.status];
        rowExtraStyle += `background:${sc.bg};border-left:2px solid ${sc.border};`;
      }

      if (node.highlight && !node.status) {
        rowExtraStyle += 'background:var(--vp-c-brand-soft,rgba(100,108,255,0.06));';
      }

      const rowClasses = 'vp-folder-tree__row' + (isFocused ? ' is-focused' : '');

      const row = h('div', {
        class: rowClasses,
        'data-path': path,
        style: rowExtraStyle || undefined,
        onClick: (e) => {
          e.stopPropagation();
          if (e.ctrlKey || e.metaKey) {
            onNodeContextMenu(e, node, path);
            return;
          }
          if (canToggle) emit('toggle', path);
        },
        onKeydown: canToggle ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emit('toggle', path); } } : undefined,
        onMouseenter: (e) => { handleHoverBranch(path); onNodeTooltipEnter(e, node); },
        onMouseleave: () => { onNodeTooltipLeave(); },
        onContextmenu: (e) => { onNodeContextMenu(e, node, path); },
        tabindex: -1,
        role: node.isFolder ? 'treeitem' : 'none',
        'aria-expanded': node.isFolder ? String(isOpen) : undefined,
      }, els);

      const childEls = [];
      if (node.isFolder && hasChildren) {
        const guideLeft = depth * INDENT_PX + GUIDE_OFFSET;

        const childrenContent = h('div', { style: 'overflow:hidden' }, [
          h('div', {
            class: 'vp-folder-tree__branch',
            style: 'position:relative;margin-left:0',
          }, [
            h('span', {
              class: 'vp-folder-tree__guide',
              style: `position:absolute;left:${guideLeft}px;top:0;bottom:8px;width:1px;background:var(--vp-c-divider,#e2e2e3);pointer-events:none`,
            }),
            h('ul', { class: 'vp-folder-tree__children' },
              children.map((child, ci) =>
                h('li', { key: child.name + ci }, [
                  h(FolderNode, {
                    node: child,
                    depth: depth + 1,
                    path: path + '/' + child.name,
                    expandedMap,
                    interactive,
                    showBadges,
                    search,
                    parentMatched: parentMatched || nodeSelfMatches(node, search),
                    onToggle: (p) => emit('toggle', p),
                  }),
                ])
              )
            ),
          ])
        ]);

        childEls.push(
          h('div', {
            style: `display:grid;grid-template-rows:${isOpen ? '1fr' : '0fr'};transition:grid-template-rows 0.2s ease-out`,
          }, [childrenContent])
        );
      }

      return h('div', {}, [row, ...childEls]);
    };
  },
});
</script>

<style>
/* ═══════════════════════════════════════════════════════════════════
   Clean UI — Linear / Vercel / VS Code aesthetic (2025)
   ═══════════════════════════════════════════════════════════════════ */

.vp-folder-tree {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt, #f9f9fa);
  overflow: hidden;
  font-family: var(--vp-font-family-base, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif);
  font-size: 13px;
  line-height: 1.3;
  user-select: none;
}

/* Reset VitePress inherited styles inside tree content */
.vp-folder-tree__list div,
.vp-folder-tree__list span,
.vp-folder-tree__children div,
.vp-folder-tree__children span {
  margin: 0;
  padding: 0;
}

.vp-folder-tree__inner:focus { outline: none; }
.vp-folder-tree__inner:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #3451b2);
  outline-offset: -2px;
}

/* ─── Toolbar ────────────────────────────────────────────────────── */
.vp-folder-tree__toolbar {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg, #fff);
  gap: 2px;
}

.vp-folder-tree__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--vp-c-text-3, #8e8e93);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  user-select: none;
  line-height: 1;
  font-family: inherit;
}

.vp-folder-tree__btn svg { flex-shrink: 0; }
.vp-folder-tree__btn:hover {
  background: var(--vp-c-bg-soft, #f6f6f7);
  color: var(--vp-c-text-1, #213547);
}
.vp-folder-tree__btn:active {
  background: var(--vp-c-default-soft, rgba(142, 150, 170, 0.12));
}

.vp-folder-tree__toolbar-sep {
  width: 1px;
  height: 14px;
  background: var(--vp-c-divider);
  margin: 0 4px;
  flex-shrink: 0;
  opacity: 0.6;
}

/* ─── Dropdown ───────────────────────────────────────────────────── */
.vp-folder-tree__dropdown-wrap { position: relative; }

.vp-folder-tree__dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 100px;
}

.vp-folder-tree__dropdown-menu button {
  display: block;
  width: 100%;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background: none;
  text-align: left;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  color: var(--vp-c-text-1, #213547);
  line-height: 1.5;
}

.vp-folder-tree__dropdown-menu button:hover {
  background: var(--vp-c-brand-1, #3451b2);
  color: #fff;
}

/* ─── Search ─────────────────────────────────────────────────────── */
.vp-folder-tree__search-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: auto;
}

.vp-folder-tree__search-icon {
  position: absolute;
  left: 6px;
  pointer-events: none;
  color: var(--vp-c-text-3, #8e8e93);
}

.vp-folder-tree__search {
  height: 24px;
  padding: 0 8px 0 24px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: var(--vp-c-bg-soft, #f6f6f7);
  color: var(--vp-c-text-1, #213547);
  font-size: 12px;
  font-family: inherit;
  outline: none;
  width: 120px;
  transition: all 0.2s;
}

.vp-folder-tree__search:focus {
  background: var(--vp-c-bg, #fff);
  border-color: var(--vp-c-brand-1, #3451b2);
  width: 160px;
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft, rgba(100, 108, 255, 0.14));
}

.vp-folder-tree__search-clear {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--vp-c-text-3, #8e8e93);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  padding: 0 2px;
  border-radius: 2px;
}

.vp-folder-tree__search-clear:hover {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg-soft, #f6f6f7);
}

/* ─── Tabs (Chrome-style) ────────────────────────────────────────── */
.vp-folder-tree__tabs {
  display: flex;
  overflow-x: auto;
  background: var(--vp-c-bg-soft, #f6f6f7);
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 4px 4px 0;
  gap: 2px;
}

.vp-folder-tree__tab {
  padding: 5px 14px;
  font-size: 12px;
  font-family: inherit;
  border-radius: 6px 6px 0 0;
  border: 1px solid transparent;
  border-bottom: none;
  background: transparent;
  color: var(--vp-c-text-2, #595959);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s, background 0.15s;
  white-space: nowrap;
  user-select: none;
}

.vp-folder-tree__tab:hover {
  opacity: 1;
  background: var(--vp-c-bg, #fff);
}

.vp-folder-tree__tab.is-active {
  background: var(--vp-c-bg, #fff);
  border-color: var(--vp-c-divider);
  border-bottom-color: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #213547);
  opacity: 1;
  font-weight: 600;
  margin-bottom: -1px;
}

/* ─── States ─────────────────────────────────────────────────────── */
.vp-folder-tree__loading,
.vp-folder-tree__empty {
  padding: 16px;
  color: var(--vp-c-text-3, #8e8e93);
  font-size: 12px;
  text-align: center;
}

.vp-folder-tree__error {
  padding: 8px 12px;
  color: #d43838;
  font-size: 12px;
}

/* ─── Tree list ──────────────────────────────────────────────────── */
.vp-folder-tree ul,
.vp-folder-tree li {
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: inherit !important;
}

.vp-folder-tree li::before,
.vp-folder-tree li::marker {
  content: none !important;
  display: none !important;
}

.vp-folder-tree__list,
.vp-folder-tree__children {
  list-style: none;
  margin: 0;
  padding: 0;
}

.vp-folder-tree__list { padding: 2px 0 !important; }

.vp-folder-tree__list > li,
.vp-folder-tree__children > li {
  list-style: none;
  margin: 0;
  padding: 0;
}

.vp-folder-tree__branch { position: relative; }

.vp-folder-tree__guide {
  opacity: 0.4;
  transition: opacity 0.15s;
}

.vp-folder-tree__branch:hover > .vp-folder-tree__guide {
  opacity: 0.8;
}

/* ─── Rows ───────────────────────────────────────────────────────── */
.vp-folder-tree__row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 1px;
  height: 24px;
  padding: 0 8px 0 6px;
  border-radius: 4px;
  margin: 0 4px;
  cursor: default;
  transition: background-color 0.1s;
  user-select: none;
}

.vp-folder-tree__row:hover {
  background: var(--vp-c-bg-soft, rgba(142, 150, 170, 0.08));
}

.vp-folder-tree__row--on-branch {
  background: var(--vp-c-bg-soft, rgba(142, 150, 170, 0.04));
}

.vp-folder-tree__row:focus { outline: none; }
.vp-folder-tree__row:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #3451b2);
  outline-offset: -2px;
}

.vp-folder-tree__row a {
  color: var(--vp-c-brand-1, #3451b2);
  text-decoration: none;
}
.vp-folder-tree__row a:hover { text-decoration: underline; }

/* ─── Deep link focus ────────────────────────────────────────────── */
.vp-folder-tree__row.is-focused {
  background: var(--vp-c-brand-soft, rgba(100, 108, 255, 0.12));
  animation: vp-tree-flash 2s ease-out;
}

@keyframes vp-tree-flash {
  0%   { box-shadow: 0 0 0 0 var(--vp-c-brand-1, rgba(52, 81, 178, 0.5)); }
  40%  { box-shadow: 0 0 0 4px var(--vp-c-brand-1, rgba(52, 81, 178, 0.2)); }
  100% { box-shadow: 0 0 0 0 var(--vp-c-brand-1, rgba(52, 81, 178, 0)); }
}

/* ─── Footer ─────────────────────────────────────────────────────── */
.vp-folder-tree__footer {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-3, #8e8e93);
  font-size: 11px;
  line-height: 1;
  opacity: 0.7;
}

.vp-folder-tree__footer svg { flex-shrink: 0; }
.vp-folder-tree__footer-dot { margin: 0 2px; opacity: 0.5; }

/* ─── Context menu ───────────────────────────────────────────────── */
.vp-folder-tree__ctx {
  position: fixed;
  z-index: 100;
  min-width: 160px;
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.2);
  padding: 4px;
  font-size: 13px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.vp-folder-tree__ctx-item {
  padding: 6px 10px;
  border-radius: 4px;
  cursor: default;
  color: var(--vp-c-text-1, #213547);
  transition: background 0.1s, color 0.1s;
}

.vp-folder-tree__ctx-item:hover {
  background: var(--vp-c-brand-1, #3451b2);
  color: #fff;
}

/* ─── Tooltip ────────────────────────────────────────────────────── */
.vp-folder-tree__tooltip {
  position: fixed;
  z-index: 101;
  background: #202020;
  color: #e8e8e8;
  border: 1px solid #333;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: var(--vp-font-family-mono, 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace);
  font-size: 12px;
  line-height: 1.5;
  max-width: 360px;
  white-space: pre;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.vp-folder-tree__tooltip pre {
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  white-space: pre;
  overflow-x: auto;
}

/* ─── Reduced motion ─────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .vp-folder-tree__row,
  .vp-folder-tree__btn,
  .vp-folder-tree__search,
  .vp-folder-tree__guide,
  .vp-folder-tree__ctx-item,
  .vp-folder-tree__tab {
    transition: none !important;
  }
  .vp-folder-tree__row.is-focused {
    animation: none !important;
  }
}
</style>
