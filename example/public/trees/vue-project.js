// JS module — reads local data and builds the tree dynamically
// Demonstrates: export default function, fs.readFileSync(), dynamic tree generation

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export default function () {
  // Load project metadata from a JSON file in the same directory
  const __dir = dirname(fileURLToPath(import.meta.url));
  const data = JSON.parse(readFileSync(join(__dir, 'vue-project-data.json'), 'utf-8'));

  return [
    {
      name: 'vue-app',
      description: data.framework,
      note: `v${data.version}`,
      children: [
        {
          name: 'src',
          children: [
            {
              name: 'components',
              children: [
                { name: 'ui', children: data.components },
                'Header.vue',
                'Footer.vue',
              ],
            },
            {
              name: 'composables',
              children: data.composables,
            },
            {
              name: 'pages',
              children: [
                ...data.pages,
                { name: 'blog', children: ['index.vue', '[slug].vue'] },
              ],
            },
            'App.vue',
            'main.ts',
            'router.ts',
          ],
        },
        {
          name: 'public',
          children: ['favicon.ico', 'robots.txt'],
        },
        {
          name: 'tests',
          open: false,
          note: data.tests.coverage + ' coverage',
          children: [
            { name: 'unit', children: data.tests.unit },
            { name: 'e2e', children: data.tests.e2e },
          ],
        },
        '.gitignore',
        '.env.example',
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        { name: 'README.md', icon: '📖' },
      ],
    },
  ];
}
