# Examples

## Simple: i18n Locales

<details>
<summary>Show code</summary>

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

</details>

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

## Vue Project

<details>
<summary>Show code</summary>

````yaml
```tree
- name: my-app
  children:
    - name: src
      children:
        - name: components
          children:
            - name: ui
              children:
                - Button.vue
                - Modal.vue
                - Input.vue
            - Header.vue
            - Footer.vue
        - name: composables
          children:
            - useAuth.ts
            - useFetch.ts
        - name: pages
          children:
            - index.vue
            - about.vue
            - name: blog
              children:
                - index.vue
                - "[slug].vue"
        - App.vue
        - main.ts
    - name: public
      children:
        - favicon.ico
    - .gitignore
    - package.json
    - tsconfig.json
    - vite.config.ts
```
````

</details>

```tree
- name: my-app
  children:
    - name: src
      children:
        - name: components
          children:
            - name: ui
              children:
                - Button.vue
                - Modal.vue
                - Input.vue
            - Header.vue
            - Footer.vue
        - name: composables
          children:
            - useAuth.ts
            - useFetch.ts
        - name: pages
          children:
            - index.vue
            - about.vue
            - name: blog
              children:
                - index.vue
                - "[slug].vue"
        - App.vue
        - main.ts
    - name: public
      children:
        - favicon.ico
    - .gitignore
    - package.json
    - tsconfig.json
    - vite.config.ts
```

## Rich Metadata

Use `description`, `note`, `highlight`, `icon`, `open`, `locked`:

<details>
<summary>Show code</summary>

````yaml
```tree
- name: api-server
  icon: "\U0001F680"
  description: "Backend"
  note: "v2.4.1"
  children:
    - name: src
      children:
        - name: routes
          description: "HTTP handlers"
          note: "3 endpoints"
          children:
            - name: auth.ts
              highlight: true
              description: "needs review"
              note: "PR #42"
            - users.ts
            - posts.ts
        - name: middleware
          children:
            - cors.ts
            - auth.ts
            - logger.ts
        - name: models
          open: false
          children:
            - User.ts
            - Post.ts
            - Comment.ts
        - name: db
          locked: true
          children:
            - name: connection.ts
              highlight: true
              description: "TODO: pool"
            - migrations.ts
        - index.ts
    - name: tests
      open: false
      description: "Tests"
      note: "87% coverage"
      children:
        - auth.test.ts
        - users.test.ts
        - posts.test.ts
    - name: dist
      type: folder
      locked: true
      description: "Build output"
    - package.json
    - tsconfig.json
    - name: .env
      icon: "\U0001F510"
      note: "Do not commit!"
    - Dockerfile
    - name: README.md
      note: "updated 2 days ago"
```
````

</details>

```tree
- name: api-server
  icon: "\U0001F680"
  description: "Backend"
  note: "v2.4.1"
  children:
    - name: src
      children:
        - name: routes
          description: "HTTP handlers"
          note: "3 endpoints"
          children:
            - name: auth.ts
              highlight: true
              description: "needs review"
              note: "PR #42"
            - users.ts
            - posts.ts
        - name: middleware
          children:
            - cors.ts
            - auth.ts
            - logger.ts
        - name: models
          open: false
          children:
            - User.ts
            - Post.ts
            - Comment.ts
        - name: db
          locked: true
          children:
            - name: connection.ts
              highlight: true
              description: "TODO: pool"
            - migrations.ts
        - index.ts
    - name: tests
      open: false
      description: "Tests"
      note: "87% coverage"
      children:
        - auth.test.ts
        - users.test.ts
        - posts.test.ts
    - name: dist
      type: folder
      locked: true
      description: "Build output"
    - package.json
    - tsconfig.json
    - name: .env
      icon: "\U0001F510"
      note: "Do not commit!"
    - Dockerfile
    - name: README.md
      note: "updated 2 days ago"
```

## Links (href)

Items with `href` become clickable — useful for linking to documentation pages:

<details>
<summary>Show code</summary>

````yaml
```tree
- name: project
  children:
    - name: src
      children:
        - name: index.ts
          href: "https://github.com/s00d/vitepress-plugin-folder-tree"
          description: "entrypoint"
        - name: config.ts
          href: "https://github.com/..."
          note: "types"
    - name: README.md
      href: "https://github.com/..."
      icon: "\U0001F4D6"
    - name: package.json
      href: "https://www.npmjs.com/..."
```
````

</details>

```tree
- name: project
  children:
    - name: src
      children:
        - name: index.ts
          href: "https://github.com/s00d/vitepress-plugin-folder-tree"
          description: "entrypoint"
        - name: config.ts
          href: "https://github.com/s00d/vitepress-plugin-folder-tree/blob/main/src/config.ts"
          note: "types"
    - name: README.md
      href: "https://github.com/s00d/vitepress-plugin-folder-tree#readme"
      icon: "\U0001F4D6"
    - name: package.json
      href: "https://www.npmjs.com/package/vitepress-plugin-folder-tree"
```

## ASCII Format

You can paste standard ASCII tree output directly — the plugin auto-detects the format:

<details>
<summary>Show code</summary>

````text
```tree
my-project/
├── src/
│   ├── components/
│   │   ├── Button.vue
│   │   ├── Modal.vue
│   │   └── Input.vue
│   ├── composables/
│   │   ├── useAuth.ts
│   │   └── useFetch.ts
│   ├── App.vue
│   └── main.ts
├── public/
│   └── favicon.ico
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts
```
````

</details>

```tree
my-project/
├── src/
│   ├── components/
│   │   ├── Button.vue
│   │   ├── Modal.vue
│   │   └── Input.vue
│   ├── composables/
│   │   ├── useAuth.ts
│   │   └── useFetch.ts
│   ├── App.vue
│   └── main.ts
├── public/
│   └── favicon.ico
├── .gitignore
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Without a root:

<details>
<summary>Show code</summary>

````text
```tree
├── src
│   ├── index.ts
│   └── utils.ts
├── tests
│   └── index.test.ts
├── package.json
└── README.md
```
````

</details>

```tree
├── src
│   ├── index.ts
│   └── utils.ts
├── tests
│   └── index.test.ts
├── package.json
└── README.md
```

## Diff / Git Status

Show file changes with Git-style decorations. Use `status: added`, `status: modified`, `status: deleted` (or `status: removed`):

- **added** — green text + `A` badge
- **modified** — amber text + `M` badge
- **deleted** / **removed** — red text + `D` badge + strikethrough

<details>
<summary>Show code</summary>

````yaml
```tree
- name: my-app
  note: "v2.0 release"
  children:
    - name: src
      children:
        - name: components
          children:
            - name: Button.vue
              status: modified
              note: "updated props"
            - name: Modal.vue
              status: deleted
              note: "deprecated"
            - name: Drawer.vue
              status: added
              note: "new component"
            - name: Input.vue
              status: modified
        - name: pages
          children:
            - index.vue
            - name: settings.vue
              status: added
              description: "new page"
        - name: utils
          children:
            - name: helpers.ts
              status: modified
            - name: legacy.ts
              status: deleted
            - name: validators.ts
              status: added
        - App.vue
        - main.ts
    - name: package.json
      status: modified
      note: "new deps"
    - name: CHANGELOG.md
      status: added
    - tsconfig.json
```
````

</details>

```tree
- name: my-app
  note: "v2.0 release"
  children:
    - name: src
      children:
        - name: components
          children:
            - name: Button.vue
              status: modified
              note: "updated props"
            - name: Modal.vue
              status: deleted
              note: "deprecated"
            - name: Drawer.vue
              status: added
              note: "new component"
            - name: Input.vue
              status: modified
        - name: pages
          children:
            - index.vue
            - name: settings.vue
              status: added
              description: "new page"
        - name: utils
          children:
            - name: helpers.ts
              status: modified
            - name: legacy.ts
              status: deleted
            - name: validators.ts
              status: added
        - App.vue
        - main.ts
    - name: package.json
      status: modified
      note: "new deps"
    - name: CHANGELOG.md
      status: added
    - tsconfig.json
```

Minimal example:

<details>
<summary>Show code</summary>

````yaml
```tree
- name: config.ts
  status: modified
- name: new-feature.ts
  status: added
- name: old-module.ts
  status: deleted
```
````

</details>

```tree
- name: config.ts
  status: modified
- name: new-feature.ts
  status: added
- name: old-module.ts
  status: deleted
```

## Locked Folders

Folders with `locked: true` cannot be toggled by the user — the chevron is dimmed and a lock icon is shown. `Expand all` / `Collapse all` also respect the lock. Try clicking on `db` or `dist` below — they won't toggle.

<details>
<summary>Show code</summary>

````yaml
```tree
- name: backend
  children:
    - name: src
      children:
        - name: db
          locked: true
          description: "Do not touch"
          children:
            - connection.ts
            - migrations.ts
            - seeds.ts
        - name: services
          children:
            - auth.service.ts
            - user.service.ts
    - name: dist
      locked: true
      description: "Auto-generated"
      children:
        - index.js
        - index.d.ts
    - name: config
      children:
        - database.yml
        - app.yml
    - package.json
```
````

</details>

```tree
- name: backend
  children:
    - name: src
      children:
        - name: db
          locked: true
          description: "Do not touch"
          children:
            - connection.ts
            - migrations.ts
            - seeds.ts
        - name: services
          children:
            - auth.service.ts
            - user.service.ts
    - name: dist
      locked: true
      description: "Auto-generated"
      children:
        - index.js
        - index.d.ts
    - name: config
      children:
        - database.yml
        - app.yml
    - package.json
```

## Collapsed by Default

All folders start collapsed. Click to expand manually.

Use `options.defaultOpen: false` inside the YAML body:

````yaml
```tree
options:
  defaultOpen: false
tree:
  - name: src
    children:
      - index.ts
```
````

<details>
<summary>Show code</summary>

````yaml
```tree
options:
  defaultOpen: false
tree:
  - name: monorepo
    note: "pnpm workspace"
    children:
      - name: packages
        children:
          - name: core
            ...
```
````

</details>

```tree
options:
  defaultOpen: false
tree:
  - name: monorepo
    note: "pnpm workspace"
    children:
      - name: packages
        children:
          - name: core
            note: "v1.0.0"
            children:
              - name: src
                children:
                  - index.ts
              - package.json
              - tsconfig.json
          - name: ui
            note: "v0.8.2"
            children:
              - name: src
                children:
                  - name: components
                    children:
                      - Button.tsx
                      - Card.tsx
                      - index.ts
                  - index.ts
              - package.json
              - tsconfig.json
          - name: utils
            note: "v1.2.0"
            children:
              - name: src
                children:
                  - index.ts
              - package.json
              - tsconfig.json
      - name: apps
        children:
          - name: web
            children:
              - name: src
                children:
                  - main.tsx
              - package.json
          - name: docs
            children:
              - name: src
                children:
                  - index.md
              - package.json
      - package.json
      - pnpm-workspace.yaml
      - turbo.json
      - README.md
```

## Hidden Toolbar

No toolbar — no expand/collapse buttons, no copy, no search.

<details>
<summary>Show code</summary>

````yaml
```tree
options:
  showToolbar: false
tree:
  - name: my-lib
    children:
      - name: src
        children:
          - index.ts
          - utils.ts
          - types.ts
      - name: tests
        children:
          - index.test.ts
          - utils.test.ts
      - package.json
      - tsconfig.json
      - README.md
```
````

</details>

```tree
options:
  showToolbar: false
tree:
  - name: my-lib
    children:
      - name: src
        children:
          - index.ts
          - utils.ts
          - types.ts
      - name: tests
        children:
          - index.test.ts
          - utils.test.ts
      - package.json
      - tsconfig.json
      - README.md
```

## Static Mode (non-interactive)

Fully static tree — no toggling, no toolbar. Pure snapshot.

<details>
<summary>Show code</summary>

````yaml
```tree
options:
  interactive: false
tree:
  - name: snapshot
    children:
      - name: src
        children:
          - main.rs
          - lib.rs
          - name: modules
            children:
              - parser.rs
              - compiler.rs
      - Cargo.toml
      - Cargo.lock
      - README.md
```
````

</details>

```tree
options:
  interactive: false
tree:
  - name: snapshot
    children:
      - name: src
        children:
          - main.rs
          - lib.rs
          - name: modules
            children:
              - parser.rs
              - compiler.rs
      - Cargo.toml
      - Cargo.lock
      - README.md
```

## Combined Options

Combine multiple options at once:

<details>
<summary>Show code</summary>

````yaml
```tree
options:
  defaultOpen: false
  showBadges: false
tree:
  - name: app
    children:
      - name: frontend
        children:
          - name: src
            children:
              - App.vue
              - main.ts
          - package.json
      - name: backend
        children:
          - name: src
            children:
              - index.ts
              - server.ts
          - package.json
      - docker-compose.yml
      - README.md
```
````

</details>

```tree
options:
  defaultOpen: false
  showBadges: false
tree:
  - name: app
    children:
      - name: frontend
        children:
          - name: src
            children:
              - App.vue
              - main.ts
          - package.json
      - name: backend
        children:
          - name: src
            children:
              - index.ts
              - server.ts
          - package.json
      - docker-compose.yml
      - README.md
```

## Load from URL

Load the tree from an external file — supports **YAML**, **JSON**, and **JS** modules.

### YAML file

````yaml
```tree
url: /trees/vue-project.yaml
```
````

```tree
url: /trees/vue-project.yaml
```

### JS module (local file)

JS files use `export default` — supports arrays, objects, and functions. The module is executed **at build time** in Node.js, so you can use `fs`, `path`, and other Node APIs.

This example reads a local JSON file and builds the tree from it:

<details>
<summary>Show vue-project.js</summary>

```js
// public/trees/vue-project.js
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export default function () {
  const __dir = dirname(fileURLToPath(import.meta.url));
  const data = JSON.parse(readFileSync(join(__dir, 'vue-project-data.json'), 'utf-8'));

  return [
    {
      name: 'vue-app',
      description: data.framework,
      note: `v${data.version}`,
      children: [
        { name: 'src', children: [
          { name: 'components', children: [
            { name: 'ui', children: data.components },
            'Header.vue',
          ]},
          { name: 'composables', children: data.composables },
          // ...
        ]},
      ],
    },
  ];
}
```

</details>

````yaml
```tree
url: /trees/vue-project.js
```
````

```tree
url: /trees/vue-project.js
```

### JS module (fetch)

You can also use `fetch()` to load data from an HTTP URL. The function can be `async`:

<details>
<summary>Show example</summary>

```js
// public/trees/remote-project.js
export default async function () {
  const res = await fetch('https://api.example.com/project-structure.json');
  const data = await res.json();

  return [
    {
      name: data.name,
      children: data.files.map(f => ({ name: f })),
    },
  ];
}
```

</details>

````yaml
```tree
url: /trees/remote-project.js
```
````

### URL + options

<details>
<summary>Show code</summary>

````yaml
```tree
url: /trees/vue-project.yaml
options:
  defaultOpen: false
  showBadges: false
```
````

</details>

```tree
url: /trees/vue-project.yaml
options:
  defaultOpen: false
  showBadges: false
```

## Monorepo (large tree — try search!)

Use the **search** field in the toolbar to filter files by name:

<details>
<summary>Show code</summary>

````yaml
```tree
- name: monorepo
  note: "pnpm workspace"
  children:
    - name: packages
      children:
        - name: core
          note: "v1.0.0"
          children:
            - name: src
              children:
                - index.ts
            - package.json
            - tsconfig.json
        - name: ui
          note: "v0.8.2"
          children:
            - name: src
              children:
                - name: components
                  children:
                    - Button.tsx
                    - Card.tsx
                    - index.ts
                - index.ts
            - package.json
            - tsconfig.json
        - name: utils
          note: "v1.2.0"
          children:
            - name: src
              children:
                - index.ts
            - package.json
            - tsconfig.json
    - name: apps
      children:
        - name: web
          children:
            - name: src
              children:
                - main.tsx
            - package.json
        - name: docs
          children:
            - name: src
              children:
                - index.md
            - package.json
    - name: .github
      open: false
      children:
        - name: workflows
          children:
            - ci.yml
            - release.yml
    - package.json
    - pnpm-workspace.yaml
    - turbo.json
    - README.md
```
````

</details>

```tree
- name: monorepo
  note: "pnpm workspace"
  children:
    - name: packages
      children:
        - name: core
          note: "v1.0.0"
          children:
            - name: src
              children:
                - index.ts
            - package.json
            - tsconfig.json
        - name: ui
          note: "v0.8.2"
          children:
            - name: src
              children:
                - name: components
                  children:
                    - Button.tsx
                    - Card.tsx
                    - index.ts
                - index.ts
            - package.json
            - tsconfig.json
        - name: utils
          note: "v1.2.0"
          children:
            - name: src
              children:
                - index.ts
            - package.json
            - tsconfig.json
    - name: apps
      children:
        - name: web
          children:
            - name: src
              children:
                - main.tsx
            - package.json
        - name: docs
          children:
            - name: src
              children:
                - index.md
            - package.json
    - name: .github
      open: false
      children:
        - name: workflows
          children:
            - ci.yml
            - release.yml
    - package.json
    - pnpm-workspace.yaml
    - turbo.json
    - README.md
```

## Auto-generate from Filesystem

Scan a real directory at build time — no manual YAML needed:

````yaml
```tree
from: ./src
depth: 3
```
````

```tree
from: ../src
```

With filtering — only `.ts` files:

<details>
<summary>Show code</summary>

````yaml
```tree
from: ../src
name: "TypeScript source"
include:
  - "*.ts"
options:
  defaultOpen: false
```
````

</details>

```tree
from: ../src
name: "TypeScript source"
include:
  - "*.ts"
options:
  defaultOpen: false
```

Without root wrapper:

<details>
<summary>Show code</summary>

````yaml
```tree
from: ../src
showRoot: false
exclude:
  - "*.vue"
```
````

</details>

```tree
from: ../src
showRoot: false
exclude:
  - "*.vue"
```

## Preview Tooltip

Add `preview` to show code or text in a tooltip on hover (appears after 600ms):

<details>
<summary>Show code</summary>

````yaml
```tree
- name: src
  children:
    - name: index.ts
      preview: "import { createApp } from 'vue'\nimport App from './App.vue'\n\ncreateApp(App).mount('#app')"
      description: "entrypoint"
    - name: utils.ts
      preview: "export function formatDate(d: Date) {\n  return d.toISOString().split('T')[0];\n}"
    - name: config.ts
      preview: "export interface Config {\n  port: number;\n  host: string;\n  debug: boolean;\n}"
      note: "types"
    - name: App.vue
      preview: "<template>\n  <div id=\"app\">\n    <router-view />\n  </div>\n</template>"
```
````

</details>

```tree
- name: src
  children:
    - name: index.ts
      preview: "import { createApp } from 'vue'\nimport App from './App.vue'\n\ncreateApp(App).mount('#app')"
      description: "entrypoint"
    - name: utils.ts
      preview: "export function formatDate(d: Date) {\n  return d.toISOString().split('T')[0];\n}"
    - name: config.ts
      preview: "export interface Config {\n  port: number;\n  host: string;\n  debug: boolean;\n}"
      note: "types"
    - name: App.vue
      preview: "<template>\n  <div id=\"app\">\n    <router-view />\n  </div>\n</template>"
```

## Context Menu

Open the context menu on any node using one of these methods:

| Method | How |
|---|---|
| **Right-click** | Standard right mouse button on a node |
| **Ctrl + Click** | Hold `Ctrl` (or `Cmd` on Mac) and left-click a node |
| **Shift + F10** | Focus a row with arrow keys, then press `Shift + F10` |

The context menu provides:

- **Copy Name** — copies just the file/folder name (e.g. `Button.vue`)
- **Copy Path** — copies the full tree path (e.g. `src/components/Button.vue`)

Press `Escape` to close the menu.

Try all three methods on the tree below:

<details>
<summary>Show code</summary>

````yaml
```tree
- name: project
  children:
    - name: src
      children:
        - name: components
          children:
            - name: Button.vue
              description: "right-click me!"
            - Modal.vue
            - Input.vue
        - name: utils
          children:
            - helpers.ts
            - format.ts
        - App.vue
        - main.ts
    - package.json
    - tsconfig.json
```
````

</details>

```tree
- name: project
  children:
    - name: src
      children:
        - name: components
          children:
            - name: Button.vue
              description: "right-click me!"
            - Modal.vue
            - Input.vue
        - name: utils
          children:
            - helpers.ts
            - format.ts
        - App.vue
        - main.ts
    - package.json
    - tsconfig.json
```

## Shell Script Generation

Click the **`>_`** (terminal) button in any toolbar to copy a shell script that recreates the folder structure. The generated script uses `mkdir -p` for folders and `touch` for files. Paste it into your terminal to scaffold the project instantly.

Try it on any tree above!

## Deep Linking (Focus via URL)

Append a `#path` to the page URL to auto-expand and focus a specific node. The tree will:

1. Expand all ancestor folders
2. Scroll to the target node
3. Highlight it with a pulse animation

Example: add `#my-app/src/components/ui/Button.vue` to the URL hash and the [Vue Project](#vue-project) tree will expand and highlight that file.

## Tabs Mode

Use the `tab` field on root-level items to create switchable tabs — perfect for comparing "Before vs After" or "Client vs Server" structures:

<details>
<summary>Show code</summary>

````yaml
```tree
- tab: "Frontend"
  children:
    - name: src
      children:
        - name: components
          children:
            - Button.vue
            - Modal.vue
        - App.vue
        - main.ts
    - package.json
    - vite.config.ts
- tab: "Backend"
  children:
    - name: src
      children:
        - name: routes
          children:
            - auth.ts
            - users.ts
        - name: middleware
          children:
            - cors.ts
            - logger.ts
        - index.ts
    - package.json
    - tsconfig.json
- tab: "Shared"
  children:
    - name: packages
      children:
        - name: types
          children:
            - index.d.ts
            - api.d.ts
        - name: utils
          children:
            - format.ts
            - validate.ts
    - pnpm-workspace.yaml
```
````

</details>

```tree
- tab: "Frontend"
  children:
    - name: src
      children:
        - name: components
          children:
            - Button.vue
            - Modal.vue
        - App.vue
        - main.ts
    - package.json
    - vite.config.ts
- tab: "Backend"
  children:
    - name: src
      children:
        - name: routes
          children:
            - auth.ts
            - users.ts
        - name: middleware
          children:
            - cors.ts
            - logger.ts
        - index.ts
    - package.json
    - tsconfig.json
- tab: "Shared"
  children:
    - name: packages
      children:
        - name: types
          children:
            - index.d.ts
            - api.d.ts
        - name: utils
          children:
            - format.ts
            - validate.ts
    - pnpm-workspace.yaml
```

Tabs with diff statuses:

<details>
<summary>Show code</summary>

````yaml
```tree
- tab: "Before"
  children:
    - name: src
      children:
        - name: utils.ts
          note: "old helpers"
        - name: legacy.ts
          note: "will be removed"
        - main.ts
- tab: "After"
  children:
    - name: src
      children:
        - name: utils.ts
          status: modified
          note: "refactored"
        - name: legacy.ts
          status: deleted
        - main.ts
        - name: validators.ts
          status: added
          note: "new module"
```
````

</details>

```tree
- tab: "Before"
  children:
    - name: src
      children:
        - name: utils.ts
          note: "old helpers"
        - name: legacy.ts
          note: "will be removed"
        - main.ts
- tab: "After"
  children:
    - name: src
      children:
        - name: utils.ts
          status: modified
          note: "refactored"
        - name: legacy.ts
          status: deleted
        - main.ts
        - name: validators.ts
          status: added
          note: "new module"
```

## Keyboard Navigation

Click on any tree or press `Tab` to focus it, then use:

| Key | Action |
|---|---|
| `↓` Arrow Down | Move focus to next row |
| `↑` Arrow Up | Move focus to previous row |
| `→` Arrow Right | Expand focused folder |
| `←` Arrow Left | Collapse focused folder |
| `Enter` / `Space` | Toggle folder open/close |
| `Shift + F10` | Open context menu for focused row |
| `Escape` | Close context menu or tooltip |
| `Tab` | Enter / exit tree area |

### Modifier keys

| Modifier | Action |
|---|---|
| `Ctrl + Click` (Win/Linux) | Open context menu on clicked node |
| `Cmd + Click` (Mac) | Open context menu on clicked node |
