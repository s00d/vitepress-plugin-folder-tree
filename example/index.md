# VitePress Plugin Folder Tree

A plugin for VitePress — render beautiful, interactive file/folder tree diagrams from YAML in markdown code blocks.

## Quick Start

```tree
- name: locales
  children:
    - name: pages
      children:
        - name: index
          children:
            - en.json
            - fr.json
            - ar.json
        - name: about
          children:
            - en.json
            - fr.json
            - ar.json
    - en.json
    - fr.json
    - ar.json
```

**Code:**

````yaml
```tree
- name: locales
  children:
    - name: pages
      children:
        - name: index
          children:
            - en.json
            - fr.json
            - ar.json
        - name: about
          children:
            - en.json
            - fr.json
            - ar.json
    - en.json
    - fr.json
    - ar.json
```
````

## Features

- **YAML format** — structured, readable, easy to maintain
- **Interactive** — Click folders to expand/collapse
- **Search & filter** — Find files instantly in large trees
- **Copy as text** — Copy tree structure as ASCII art to clipboard
- **Clickable links** — `href` field makes items navigate to URLs
- **Tree guide lines** — Vertical connectors for clear hierarchy
- **Lockable** — `locked: true` prevents toggling a folder
- **Metadata** — `description` badge, `note` right-aligned text, `highlight`, `icon`
- **Initial state** — `open: false` starts folder collapsed, global `defaultOpen`
- **Toolbar** — Expand all / Collapse all / Copy / Search (hideable with `showToolbar: false`)
- **Static mode** — `interactive: false` renders a snapshot with no toggling
- **Validation** — Clear YAML error messages at build time
- **Dark Mode** — Full VitePress theme support

## Installation

```bash
pnpm add vitepress-plugin-folder-tree
```

## Setup

**1. VitePress config** — `.vitepress/config.mts`:

```ts
import { defineConfig } from 'vitepress'
import { withFolderTree } from 'vitepress-plugin-folder-tree'

export default withFolderTree(defineConfig({
  title: "My Site",
}))
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

## All Node Fields Demo

```tree
- name: project
  description: "Root"
  note: "v1.0"
  children:
    - name: src
      children:
        - name: core
          locked: true
          description: "Do not modify"
          children:
            - engine.ts
            - runtime.ts
        - name: features
          open: false
          note: "3 modules"
          children:
            - auth.ts
            - billing.ts
            - notifications.ts
        - name: index.ts
          highlight: true
          description: "entrypoint"
          note: "updated today"
    - name: dist
      type: folder
      locked: true
      description: "Auto-generated"
    - name: .env
      icon: "🔐"
      note: "secret"
    - package.json
    - name: README.md
      icon: "📖"
```

## Links Demo

Items with `href` become clickable links:

```tree
- name: docs
  children:
    - name: getting-started.md
      href: "/guide/getting-started"
      description: "Start here"
    - name: api-reference.md
      href: "/api/"
      note: "full API"
    - name: examples
      href: "/examples"
      children:
        - name: basic.md
          href: "/examples#simple-i18n-locales"
        - name: advanced.md
          href: "/examples#rich-metadata"
```

Check out the [Examples](/examples) page for more.
