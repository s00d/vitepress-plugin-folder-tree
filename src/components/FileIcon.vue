<template>
  <svg class="vft-icon" viewBox="0 0 24 24" fill="none">
    <path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      :class="styles.body"
      stroke-width="1"
    />
    <path
      d="M14 2v6h6"
      :class="styles.fold"
      stroke-width="1"
      stroke-linejoin="round"
    />
    <text
      v-if="ext"
      x="12"
      y="17"
      text-anchor="middle"
      :font-size="ext.length > 3 ? 5 : 6"
      font-weight="700"
      font-family="system-ui,sans-serif"
      :class="styles.label"
    >{{ ext.toUpperCase() }}</text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ ext: string }>();

// ─── Extension → color group mapping ─────────────────────────────────

type ColorGroup =
  | 'amber' | 'blue' | 'emerald' | 'orange' | 'gray' | 'sky'
  | 'indigo' | 'pink' | 'cyan' | 'red' | 'violet' | 'rose'
  | 'slate' | 'stone' | 'green' | 'neutral'
  | 'teal' | 'lime' | 'fuchsia' | 'yellow';

const EXT_COLOR_MAP: Record<string, ColorGroup> = {
  // ── JavaScript (yellow) ────────────────────────────────────────────
  js: 'amber', mjs: 'amber', cjs: 'amber', jsx: 'amber',
  env: 'amber', npmrc: 'amber', nvmrc: 'amber', nim: 'amber',

  // ── TypeScript (blue) ──────────────────────────────────────────────
  ts: 'blue', mts: 'blue', cts: 'blue', tsx: 'blue', d_ts: 'blue',

  // ── Vue (green) ────────────────────────────────────────────────────
  vue: 'emerald', njk: 'emerald', vim: 'emerald',

  // ── HTML / Svelte / Rust (orange) ──────────────────────────────────
  svelte: 'orange', html: 'orange', htm: 'orange', svg: 'orange',
  rs: 'orange', zig: 'orange',
  hbs: 'orange', ejs: 'amber', pug: 'orange',

  // ── Java / Gradle (red — Java coffee red) ──────────────────────────
  java: 'red', jar: 'red', gradle: 'orange',

  // ── Git (orange — official Git orange) ─────────────────────────────
  git: 'orange', gitignore: 'orange', gitattributes: 'orange', gitmodules: 'orange',

  // ── JSON / Data (teal — structured data) ───────────────────────────
  json: 'teal', json5: 'teal', jsonc: 'teal', jsonl: 'teal', ndjson: 'teal',

  // ── YAML / TOML / Config (lime — config files) ───────────────────
  yaml: 'lime', yml: 'lime', toml: 'lime',
  xml: 'orange', csv: 'green', tsv: 'green',
  ini: 'gray', cfg: 'gray', conf: 'gray', properties: 'gray',
  lock: 'gray', lockb: 'gray',
  lic: 'gray', license: 'gray',
  editorconfig: 'gray', prettierrc: 'gray', eslintrc: 'gray',
  babelrc: 'gray', browserslistrc: 'gray',
  proto: 'gray', thrift: 'gray',

  // ── Fonts (gray) ──────────────────────────────────────────────────
  woff: 'gray', woff2: 'gray', ttf: 'gray', otf: 'gray', eot: 'gray',

  // ── Markdown / Docs (sky) ──────────────────────────────────────────
  md: 'sky', mdx: 'sky', rst: 'sky', adoc: 'sky', tex: 'sky', latex: 'sky',

  // ── Docker (sky — Docker whale blue) ───────────────────────────────
  dockerfile: 'sky', dockerignore: 'sky',

  // ── Dart / Flutter (sky — Dart blue) ───────────────────────────────
  dart: 'sky',

  // ── CSS (indigo — CSS3 blue) ───────────────────────────────────────
  css: 'indigo', less: 'indigo', styl: 'indigo', stylus: 'indigo',

  // ── SCSS / Sass (pink — Sass pink) ─────────────────────────────────
  scss: 'pink', sass: 'pink',

  // ── GraphQL (fuchsia — GraphQL magenta) ───────────────────────────
  graphql: 'fuchsia', gql: 'fuchsia',

  // ── Python (cyan — Python blue-green) ──────────────────────────────
  py: 'cyan', pyi: 'cyan', pyx: 'cyan', pyw: 'cyan', ipynb: 'cyan',

  // ── Go (cyan — Go teal) ────────────────────────────────────────────
  go: 'cyan', mod: 'cyan', sum: 'cyan',

  // ── SQL / DB (cyan) ────────────────────────────────────────────────
  sql: 'cyan', sqlite: 'cyan', db: 'cyan', prisma: 'cyan',

  // ── Ruby / Perl (red — Ruby red) ───────────────────────────────────
  rb: 'red', rake: 'red', gemspec: 'red', erb: 'red',
  pl: 'red', pm: 'red', perl: 'red',

  // ── Kotlin / C# / F# / Scala / Elixir (violet — JVM/CLR purple) ──
  kt: 'violet', kts: 'violet',
  cs: 'violet', csx: 'violet',
  fs: 'violet', fsx: 'violet', fsi: 'violet',
  scala: 'violet', sbt: 'violet',
  ex: 'violet', exs: 'violet',
  el: 'violet',

  // ── Terraform / HCL (violet — HashiCorp purple) ────────────────────
  tf: 'violet', hcl: 'violet',

  // ── Swift / Objective-C (rose — Swift orange-rose) ─────────────────
  swift: 'rose', m: 'rose', mm: 'rose',

  // ── PHP (slate — PHP elephant) ─────────────────────────────────────
  php: 'slate', phtml: 'slate', blade: 'slate', twig: 'slate',

  // ── C / C++ (slate — system language steel) ────────────────────────
  c: 'slate', cpp: 'slate', cc: 'slate', cxx: 'slate',
  h: 'slate', hpp: 'slate', hxx: 'slate',

  // ── R (blue — R logo blue) ─────────────────────────────────────────
  r: 'blue', rmd: 'blue',

  // ── Lua (blue — Lua moon blue) ─────────────────────────────────────
  lua: 'blue', v: 'blue',

  // ── Shell / Make (stone — terminal) ────────────────────────────────
  sh: 'stone', bash: 'stone', zsh: 'stone', fish: 'stone',
  ps1: 'stone', psm1: 'stone', bat: 'stone', cmd: 'stone',
  make: 'stone', makefile: 'stone',

  // ── Images (green — media) ─────────────────────────────────────────
  png: 'green', jpg: 'green', jpeg: 'green', gif: 'green',
  webp: 'green', avif: 'green', ico: 'green', bmp: 'green',
  tiff: 'green', tif: 'green',

  // ── Video / Audio (rose — media entertainment) ─────────────────────
  mp4: 'rose', webm: 'rose', mov: 'rose', avi: 'rose',
  mp3: 'rose', wav: 'rose', ogg: 'rose', flac: 'rose',

  // ── Archives (stone — compressed) ──────────────────────────────────
  zip: 'stone', tar: 'stone', gz: 'stone', bz2: 'stone',
  xz: 'stone', rar: 'stone', '7z': 'stone',

  // ── Documents (branded colors) ─────────────────────────────────────
  pdf: 'red',
  doc: 'blue', docx: 'blue',
  xls: 'green', xlsx: 'green',
  ppt: 'orange', pptx: 'orange',

  // ── Binaries (neutral) ─────────────────────────────────────────────
  wasm: 'neutral', bin: 'neutral', exe: 'neutral', dll: 'neutral', so: 'neutral',

  // ── Plain text / misc (neutral) ────────────────────────────────────
  txt: 'neutral', log: 'neutral', diff: 'neutral', patch: 'neutral',
};

// ─── Color classes per color group (CSS classes from tailwind.css) ───

const COLOR_CLASSES: Record<ColorGroup, { body: string; fold: string; label: string }> = {
  amber:   { body: 'vft-ficon-amber-body',   fold: 'vft-ficon-amber-fold',   label: 'vft-ficon-amber-label' },
  blue:    { body: 'vft-ficon-blue-body',     fold: 'vft-ficon-blue-fold',    label: 'vft-ficon-blue-label' },
  emerald: { body: 'vft-ficon-emerald-body',  fold: 'vft-ficon-emerald-fold', label: 'vft-ficon-emerald-label' },
  orange:  { body: 'vft-ficon-orange-body',   fold: 'vft-ficon-orange-fold',  label: 'vft-ficon-orange-label' },
  gray:    { body: 'vft-ficon-gray-body',     fold: 'vft-ficon-gray-fold',    label: 'vft-ficon-gray-label' },
  sky:     { body: 'vft-ficon-sky-body',      fold: 'vft-ficon-sky-fold',     label: 'vft-ficon-sky-label' },
  indigo:  { body: 'vft-ficon-indigo-body',   fold: 'vft-ficon-indigo-fold',  label: 'vft-ficon-indigo-label' },
  pink:    { body: 'vft-ficon-pink-body',     fold: 'vft-ficon-pink-fold',    label: 'vft-ficon-pink-label' },
  cyan:    { body: 'vft-ficon-cyan-body',     fold: 'vft-ficon-cyan-fold',    label: 'vft-ficon-cyan-label' },
  red:     { body: 'vft-ficon-red-body',      fold: 'vft-ficon-red-fold',     label: 'vft-ficon-red-label' },
  violet:  { body: 'vft-ficon-violet-body',   fold: 'vft-ficon-violet-fold',  label: 'vft-ficon-violet-label' },
  rose:    { body: 'vft-ficon-rose-body',     fold: 'vft-ficon-rose-fold',    label: 'vft-ficon-rose-label' },
  slate:   { body: 'vft-ficon-slate-body',    fold: 'vft-ficon-slate-fold',   label: 'vft-ficon-slate-label' },
  stone:   { body: 'vft-ficon-stone-body',    fold: 'vft-ficon-stone-fold',   label: 'vft-ficon-stone-label' },
  green:   { body: 'vft-ficon-green-body',    fold: 'vft-ficon-green-fold',   label: 'vft-ficon-green-label' },
  neutral: { body: 'vft-ficon-neutral-body',  fold: 'vft-ficon-neutral-fold', label: 'vft-ficon-neutral-label' },
  teal:    { body: 'vft-ficon-teal-body',     fold: 'vft-ficon-teal-fold',    label: 'vft-ficon-teal-label' },
  lime:    { body: 'vft-ficon-lime-body',     fold: 'vft-ficon-lime-fold',    label: 'vft-ficon-lime-label' },
  fuchsia: { body: 'vft-ficon-fuchsia-body',  fold: 'vft-ficon-fuchsia-fold', label: 'vft-ficon-fuchsia-label' },
  yellow:  { body: 'vft-ficon-yellow-body',   fold: 'vft-ficon-yellow-fold',  label: 'vft-ficon-yellow-label' },
};

const color = computed<ColorGroup>(() => EXT_COLOR_MAP[props.ext] ?? 'neutral');
const styles = computed(() => COLOR_CLASSES[color.value]);
</script>
