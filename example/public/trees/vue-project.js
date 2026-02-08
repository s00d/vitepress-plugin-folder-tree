// Async JS module — fetches external data and builds the tree dynamically
// Demonstrates: export default async function, fetch(), dynamic tree generation

export default async function () {
  // Load project metadata from a separate JSON file
  const res = await fetch('/trees/vue-project-data.json');
  const data = await res.json();

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
