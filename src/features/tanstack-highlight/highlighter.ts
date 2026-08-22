import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { diff } from '@tanstack/highlight/languages/diff'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'
import { json } from '@tanstack/highlight/languages/json'
import { markdown } from '@tanstack/highlight/languages/markdown'
import { shell } from '@tanstack/highlight/languages/shell'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'
import { vue } from '@tanstack/highlight/languages/vue'
import { yaml } from '@tanstack/highlight/languages/yaml'

export const highlighter = createHighlighter({
  languages: [
    css,
    diff,
    html,
    js,
    json,
    markdown,
    shell,
    ts,
    tsx,
    vue,
    yaml,
  ],
})
