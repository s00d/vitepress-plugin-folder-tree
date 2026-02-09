[![npm version](https://img.shields.io/npm/v/vitepress-plugin-folder-tree/latest?style=for-the-badge)](https://www.npmjs.com/package/vitepress-plugin-folder-tree)
[![npm downloads](https://img.shields.io/npm/dw/vitepress-plugin-folder-tree?style=for-the-badge)](https://www.npmjs.com/package/vitepress-plugin-folder-tree)
[![License](https://img.shields.io/npm/l/vitepress-plugin-folder-tree?style=for-the-badge)](https://github.com/s00d/vitepress-plugin-folder-tree/blob/main/LICENSE)
[![Donate](https://img.shields.io/badge/Donate-Donationalerts-ff4081?style=for-the-badge)](https://www.donationalerts.com/r/s00d88)

# vitepress-plugin-folder-tree

Interactive file/folder tree diagrams for [VitePress](https://vitepress.dev). Write YAML or paste ASCII — get a beautiful, collapsible Vue component.

---

## Features

| Category | What you get |
|---|---|
| **Input** | YAML, ASCII (`├── └──`), external URL (YAML/JSON/JS), filesystem scan (`from:`) |
| **Interaction** | Expand/collapse folders, keyboard nav, search & filter, context menu (right-click) |
| **Toolbar** | Expand all, Collapse all, Copy as text, Download (.txt/.yaml/.json), Shell script (`mkdir`/`touch`) |
| **Visual** | Guide lines, hover branch highlight, smooth animations, dark mode |
| **Metadata** | `description` badge, `note`, `highlight`, `icon` (emoji/Iconify), `href` links |
| **Git status** | `added` / `modified` / `deleted` indicators with color-coded badges |
| **Tabs** | `tab` field on root nodes → Chrome-style switchable tabs |
| **Deep linking** | URL hash → auto-expand, scroll, pulse animation |
| **Preview** | `preview` field → tooltip on hover (600 ms delay) |
| **Icons** | Per-extension SVG, custom emoji, Iconify classes, global `iconMap` |
| **A11y** | ARIA attributes, `prefers-reduced-motion`, keyboard navigation |

---

## Quick Start

### Install

```bash
# pnpm
pnpm add vitepress-plugin-folder-tree

# npm
npm install vitepress-plugin-folder-tree

# yarn
yarn add vitepress-plugin-folder-tree
```

### Configure

**1. VitePress config** — `.vitepress/config.mts`:

```ts
import { defineConfig } from 'vitepress'
import { withFolderTree } from 'vitepress-plugin-folder-tree'

export default withFolderTree(
  defineConfig({ title: 'My Docs' })
)
```

**2. Import styles** — `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import 'vitepress-plugin-folder-tree/style.css'

export default {
  extends: DefaultTheme,
}
```

> CSS is shipped as a separate file for better performance, caching, and CSP compatibility.

### Use

Write a fenced code block with language `tree` (or `folder-tree` / `file-tree`):

````yaml
```tree
- name: src
  children:
    - name: components
      children:
        - Button.vue
        - Modal.vue
    - App.vue
    - main.ts
- package.json
```
````

---

## Input Formats

### YAML (structured)

Each root item is a **string** (file) or **object** (file/folder with metadata):

````yaml
```tree
- name: src
  description: "Source code"
  children:
    - name: index.ts
      highlight: true
    - utils.ts
- README.md
```
````

### ASCII (paste from terminal)

Paste `tree` command output — auto-detected by `├──` / `└──` characters:

````
```tree
├── src
│   ├── index.ts
│   └── utils.ts
├── package.json
└── README.md
```
````

### External URL

Load tree from a separate file (YAML, JSON, or JS module). All URL resolution happens **at build time** — no client-side fetching:

````yaml
```tree
url: /trees/my-project.yaml
```
````

JS modules run in Node.js at build time, so you can use `fs.readFileSync`, `fetch()` for remote APIs, or any Node API:

```js
// public/trees/my-project.js
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export default function () {
  const __dir = dirname(fileURLToPath(import.meta.url));
  const data = JSON.parse(readFileSync(join(__dir, 'data.json'), 'utf-8'));
  return [{ name: 'project', children: data.files }];
}
```

### Filesystem scan

Generate tree from a real directory at build time:

````yaml
```tree
from: ./src
depth: 3
exclude:
  - "*.test.ts"
```
````

With file content preview (hover to see, click to copy):

````yaml
```tree
from: ./src
preview: true
maxPreviewSize: 4096
openDepth: 2
```
````

| Option | Type | Default | Description |
|---|---|---|---|
| `from` | `string` | — | Directory path to scan |
| `depth` | `number` | `10` | Max directory nesting depth |
| `preview` | `boolean` | `false` | Read file contents into tooltip |
| `maxPreviewSize` | `number` | `4096` | Max file size (bytes) for preview |
| `previewExtensions` | `string[]` | common text exts | Which file extensions to read |
| `openDepth` | `number` | `-1` (all) | Folder auto-open depth (`0` = all closed) |
| `exclude` | `string[]` | built-in list | Glob patterns to exclude |
| `include` | `string[]` | `[]` (all) | Glob patterns to include |
| `showRoot` | `boolean` | `true` | Wrap in root folder node |
| `name` | `string` | dir name | Custom root folder name |

---

## Node Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | *required** | File or folder name |
| `type` | `'file'` \| `'folder'` | auto | Force node type (auto: has `children` → folder) |
| `children` | `array` | — | Nested items (makes this node a folder) |
| `description` | `string` | — | Badge shown next to name |
| `note` | `string` | — | Right-aligned label |
| `highlight` | `boolean` | `false` | Accent background on the row |
| `icon` | `string` | — | Custom emoji or Iconify class |
| `open` | `boolean` | `defaultOpen` | Initial expanded state |
| `locked` | `boolean` | `false` | Prevent toggling this folder |
| `href` | `string` | — | URL — clicking the name navigates here |
| `status` | `'added'` \| `'modified'` \| `'deleted'` | — | Git-style diff badge (`A`/`M`/`D`) |
| `preview` | `string` | — | Tooltip text on hover (600 ms delay) |
| `tab` | `string` | — | Root-level tab grouping |

> \* `name` is optional when `tab` is set — the tab label is used as the name.

---

## Diff / Git Status

```yaml
- name: config.ts
  status: modified
- name: new-feature.ts
  status: added
- name: old-module.ts
  status: deleted
```

| Status | Visual |
|---|---|
| `added` | Green text + **A** badge |
| `modified` | Amber text + **M** badge |
| `deleted` / `removed` | Red text + **D** badge + strikethrough |

---

## Tabs

Use `tab` on root-level nodes to create switchable views:

````yaml
```tree
- tab: "Frontend"
  children:
    - name: src
      children:
        - App.vue
        - main.ts
    - package.json
- tab: "Backend"
  children:
    - name: src
      children:
        - index.ts
        - server.ts
    - package.json
```
````

Each tab shows the `children` of its root node. All toolbar operations (search, copy, download, shell script) work within the active tab.

---

## Deep Linking

Append `#path/to/file` to the page URL:

```
https://example.com/docs/guide.html#src/components/Button.vue
```

The tree will:
1. Switch to the correct tab (if tabs are used)
2. Expand all ancestor folders
3. Scroll to the node
4. Highlight it with a pulse animation

---

## Preview Tooltip

Add `preview` to show code/text in an IDE-style tooltip on hover:

```yaml
- name: index.ts
  preview: "import { createApp } from 'vue'\ncreateApp(App).mount('#app')"
```

Tooltip appears after 600 ms, disappears on mouse leave.

---

## Shell Script Generation

Click the **`>_`** button in the toolbar to copy a shell script (`mkdir -p` + `touch`) that recreates the tree structure. Paste into your terminal to scaffold a project instantly.

---

## Custom Icons

### Per-node icon

```yaml
- name: .env
  icon: "\U0001F510"
```

### Global `iconMap`

Map filenames or extensions to emoji/Iconify classes:

```ts
export default withFolderTree(
  defineConfig({}),
  {
    iconMap: {
      'vite.config.ts': '\u26A1',
      'ts': 'logos:typescript-icon',
      'vue': 'logos:vue',
    },
  }
)
```

Priority: full filename → extension → default SVG.

---

## Auto-generate from Filesystem

| Field | Type | Default | Description |
|---|---|---|---|
| `from` | `string` | *required* | Path to scan (relative to project root) |
| `depth` | `number` | `10` | Max scan depth |
| `name` | `string` | dir name | Override root folder display name |
| `showRoot` | `boolean` | `true` | Wrap in root folder |
| `exclude` | `string[]` | — | Glob patterns to skip |
| `include` | `string[]` | — | Glob patterns for files (folders always traversed) |

**Default excludes:** `node_modules`, `.git`, `.DS_Store`, `dist`, `.cache`, `.vitepress`, `__pycache__`, `.next`, `.nuxt`, `.idea`, `.vscode`, `coverage`, and more.

````yaml
```tree
from: ./src
include:
  - "*.ts"
  - "*.tsx"
exclude:
  - "*.test.ts"
options:
  defaultOpen: false
```
````

---

## Context Menu

Access the context menu on any node:

| Method | How |
|---|---|
| **Right-click** | Standard right mouse button |
| **Ctrl + Click** | Hold `Ctrl` (or `Cmd` on Mac) and left-click |
| **Shift + F10** | Focus a row with arrow keys, then press `Shift + F10` |

Menu actions:
- **Copy Name** — file/folder name (e.g. `Button.vue`)
- **Copy Path** — full tree path (e.g. `src/components/Button.vue`)

Press `Escape` to close.

---

## Plugin Configuration

```ts
export default withFolderTree(
  defineConfig({}),
  {
    languages: ['tree', 'file-tree', 'folder-tree'], // trigger languages
    defaultOpen: true,       // folders expanded by default
    showToolbar: true,       // show toolbar
    showBadges: true,        // auto file/folder count badges
    interactive: true,       // allow expand/collapse
    root: process.cwd(),     // base path for `from:` resolution
    iconMap: {},             // global icon overrides
  }
)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `languages` | `string[]` | `['folder-tree', 'file-tree', 'tree']` | Code block languages |
| `defaultOpen` | `boolean` | `true` | Default expand state |
| `showToolbar` | `boolean` | `true` | Toolbar visibility |
| `showBadges` | `boolean` | `true` | Auto count badges |
| `interactive` | `boolean` | `true` | Allow interaction |
| `root` | `string` | `process.cwd()` | Root for `from:` paths |
| `iconMap` | `Record<string, string>` | `{}` | Filename/ext → icon mapping |

---

## Per-block Options

Override global settings per code block:

````yaml
```tree
options:
  defaultOpen: false
  showToolbar: false
  showBadges: false
  interactive: false
tree:
  - name: src
    children:
      - index.ts
```
````

---

## Keyboard Navigation

| Key | Action |
|---|---|
| `↓` / `↑` | Move focus between rows |
| `→` | Expand focused folder |
| `←` | Collapse focused folder |
| `Enter` / `Space` | Toggle folder open/close |
| `Shift + F10` | Open context menu for focused row |
| `Escape` | Close context menu / tooltip |
| `Tab` | Enter / exit tree area |

### Modifier keys

| Modifier | Action |
|---|---|
| `Ctrl + Click` | Open context menu (Win/Linux) |
| `Cmd + Click` | Open context menu (Mac) |

---

## Toolbar Buttons

| Icon | Action |
|---|---|
| `▼` | Expand all folders |
| `▶` | Collapse all folders |
| Copy | Copy tree as ASCII text |
| `↓` | Download as .txt / .yaml / .json |
| `>_` | Copy shell script (mkdir + touch) |
| Search | Filter nodes by name/description/note |

---

## Programmatic API

```ts
import {
  validateTreeInput,
  parseTree,
  parseAsciiTree,
  scanDirectory,
} from 'vitepress-plugin-folder-tree'

// Validate YAML
const result = validateTreeInput(yamlString)
// { valid: boolean, errors: string[], warnings: string[] }

// Parse YAML → TreeNode[]
const { tree, options } = parseTree(yamlString)

// Parse ASCII → TreeNode[]
const nodes = parseAsciiTree(asciiString)

// Scan filesystem → TreeNode[]
const tree = scanDirectory('/path', 5, ['node_modules'], ['*.ts'])
```

---

## Development

```bash
pnpm install
pnpm build        # build plugin
pnpm dev          # dev server with examples
pnpm docs:build   # build example docs
```

---

## Links

- [GitHub](https://github.com/s00d/vitepress-plugin-folder-tree)
- [npm](https://www.npmjs.com/package/vitepress-plugin-folder-tree)
- [Issues](https://github.com/s00d/vitepress-plugin-folder-tree/issues)
- [Live Demo](https://github.com/s00d/vitepress-plugin-folder-tree#readme)

---

## License

[MIT](https://github.com/s00d/vitepress-plugin-folder-tree/blob/main/LICENSE) &copy; [s00d](https://github.com/s00d)
