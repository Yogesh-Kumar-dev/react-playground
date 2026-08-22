export const setupSnippet = `import { createHighlighter } from '@tanstack/highlight/core'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'

export const highlighter = createHighlighter({
  languages: [ts, tsx],
})`

export const lessonSnippet = `const cache = new Map()
const value = cache.get(key)
if (value) return value
const next = await load(key)
cache.set(key, next)
return next`

export const changelogSnippet = `--- a/src/cache.ts
+++ b/src/cache.ts
@@ -1,4 +1,5 @@
-const cache = new Map()
+const cache = new Map<string, Result>()
+
 export function get(key: string) {
   return cache.get(key)
 }`

export const vueSnippet = `<script setup lang="ts">
const score: number = 0.98
</script>

<template>
  <section class="result">
    {{ score.toFixed(2) }}
  </section>
</template>

<style>
.result { color: var(--accent) }
</style>`

export const blogSnippet = `# Why Highlight is not Shiki

TanStack Highlight is for **known docs languages** and compact HTML.

Use it in changelogs, MDX fences, and “copy this snippet” cards.
Skip it for editors, TextMate themes, and auto-detected language.
`

export const htmlEmbedSnippet = `<article>
  <h1>Release 0.0.10</h1>
  <style>
    .badge { color: var(--accent); }
  </style>
  <script>
    window.plausible?.('release')
  </script>
</article>`

export const installSnippet = `pnpm add @tanstack/highlight
pnpm exec vite build`

export const docsConfigSnippet = `site:
  highlighter: tanstack
  languages:
    - ts
    - tsx
    - vue
    - markdown
  theme:
    light: github-light
    dark: github-dark`

export const bugfixSnippet = `export function parsePort(value: string) {
  const port = Number(value)
  return port
}`
