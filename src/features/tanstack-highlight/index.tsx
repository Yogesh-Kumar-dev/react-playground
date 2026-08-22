'use client'

import { useState } from 'react'
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/features/tanstack-highlight/components/CodeBlock'
import { highlighter } from '@/features/tanstack-highlight/highlighter'
import {
  blogSnippet,
  bugfixSnippet,
  changelogSnippet,
  docsConfigSnippet,
  htmlEmbedSnippet,
  installSnippet,
  lessonSnippet,
  setupSnippet,
  vueSnippet,
} from '@/features/tanstack-highlight/samples'
import {
  decorationCss,
  themeCss,
} from '@/features/tanstack-highlight/theme'

const setup = createHighlightedCodeBlockProps({
  highlighter,
  code: setupSnippet,
  lang: 'ts',
  title: 'highlighter.ts',
  lineNumbers: true,
})

const lesson = createHighlightedCodeBlockProps({
  highlighter,
  code: lessonSnippet,
  lang: 'ts',
  title: 'cache.ts',
  lineNumbers: true,
  decorations: [
    { lines: 2, className: 'th-focus' },
    { lines: [4, 5], className: 'th-ins' },
  ],
})

const bugfix = createHighlightedCodeBlockProps({
  highlighter,
  code: bugfixSnippet,
  lang: 'ts',
  title: 'parsePort.ts',
  lineNumbers: true,
  decorations: [
    { lines: 2, className: 'th-warn' },
    { lines: 3, className: 'th-error' },
  ],
})

const changelog = createHighlightedCodeBlockProps({
  highlighter,
  code: changelogSnippet,
  lang: 'diff',
  title: 'CHANGELOG.diff',
})

const vueBlock = createHighlightedCodeBlockProps({
  highlighter,
  code: vueSnippet,
  lang: 'vue',
  title: 'ScoreCard.vue',
})

const htmlEmbed = createHighlightedCodeBlockProps({
  highlighter,
  code: htmlEmbedSnippet,
  lang: 'html',
  title: 'release.html',
})

const blog = createHighlightedCodeBlockProps({
  highlighter,
  code: blogSnippet,
  lang: 'markdown',
  title: 'why-highlight.md',
})

const install = createHighlightedCodeBlockProps({
  highlighter,
  code: installSnippet,
  lang: 'shell',
  title: 'install.sh',
})

const docsConfig = createHighlightedCodeBlockProps({
  highlighter,
  code: docsConfigSnippet,
  lang: 'yaml',
  title: 'docs.yml',
})

type Palette = 'paper' | 'carbon'

export default function TanstackHighlight() {
  const [palette, setPalette] = useState<Palette>('carbon')

  return (
    <div className="space-y-10 p-6" data-hl-theme={palette}>
      <style>{themeCss}</style>
      <style>{decorationCss}</style>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold">TanStack Highlight</h1>
          <p className="mt-1 text-muted-foreground">
            A docs highlighter, not an editor. These benches are the jobs from
            the{' '}
            <a
              href="https://tanstack.com/highlight/latest"
              className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
              target="_blank"
              rel="noreferrer"
            >
              landing page
            </a>
            : one semantic HTML tree, CSS themes, annotations, and embedded
            languages.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={palette === 'paper' ? 'default' : 'outline'}
            onClick={() => setPalette('paper')}
          >
            Paper
          </Button>
          <Button
            type="button"
            size="sm"
            variant={palette === 'carbon' ? 'default' : 'outline'}
            onClick={() => setPalette('carbon')}
          >
            Carbon
          </Button>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Same markup, two palettes</h2>
        <p className="text-sm text-muted-foreground">
          Highlight once. Paper / Carbon only flips CSS variables — no second
          tokenize pass. This is the “copy this snippet” card from a docs
          site.
        </p>
        <CodeBlock {...setup} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Annotate the lesson</h2>
        <p className="text-sm text-muted-foreground">
          Line decorations carry the teaching: focus the lookup, mark the
          insert, warn and error without changing the source.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock {...lesson} />
          <CodeBlock {...bugfix} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Changelog / release notes</h2>
        <p className="text-sm text-muted-foreground">
          Diff is a first-class language. Changelogs and PR snippets do not
          need an editor highlighter.
        </p>
        <CodeBlock {...changelog} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Embedded languages</h2>
        <p className="text-sm text-muted-foreground">
          Vue and HTML hand off script / style / expressions only when those
          languages are registered. The core ships none of them by default.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock {...vueBlock} />
          <CodeBlock {...htmlEmbed} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Blog, install, config</h2>
        <p className="text-sm text-muted-foreground">
          Markdown posts, shell commands, and YAML config — the mix a docs
          site actually renders.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock {...blog} />
          <CodeBlock {...install} />
          <CodeBlock {...docsConfig} />
        </div>
      </section>
    </div>
  )
}
