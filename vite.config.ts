import path from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "src/VpFolderTree.vue",
          dest: "./",
        },
      ],
    }),
    dts(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "FolderTreePlugin",
      fileName: (format: string) =>
        format === "es"
          ? `vitepress-plugin-folder-tree.${format}.mjs`
          : `vitepress-plugin-folder-tree.${format}.js`,
    },
    rollupOptions: {
      external: [
        "vue",
        "vitepress",
        "vite",
        "yaml",
        "path",
        "url",
        "fs",
      ],
      output: {
        globals: {
          vue: "Vue",
          yaml: "YAML",
          path: "path",
          url: "url",
          fs: "fs",
        },
      },
    },
  },
});
