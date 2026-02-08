import { defineConfig } from 'vitepress'
import { withFolderTree } from 'vitepress-plugin-folder-tree'

export default withFolderTree(
  defineConfig({
    title: "VitePress Plugin Folder Tree",
    description: "Render beautiful file tree diagrams from markdown code blocks",
    base: process.env.BASE_PATH || "/",

    themeConfig: {
      footer: {
        message: "Released under the MIT License",
      },
      search: {
        provider: "local",
      },
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Examples', link: '/examples' },
      ],
      sidebar: [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/' },
            { text: 'Examples', link: '/examples' },
          ]
        },
      ],
      socialLinks: [
        { icon: 'github', link: 'https://github.com/s00d/vitepress-plugin-folder-tree' }
      ]
    },
  })
)
