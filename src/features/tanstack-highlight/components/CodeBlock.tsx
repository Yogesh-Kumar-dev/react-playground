'use client'

import { useState } from 'react'
import type { HighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CodeBlock({
  className,
  copyText,
  htmlMarkup,
  title,
}: HighlightedCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  function copy() {
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
    void navigator.clipboard?.writeText(copyText).catch(() => undefined)
  }

  return (
    <figure
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card text-card-foreground',
        className,
      )}
    >
      <figcaption className="flex items-center justify-between gap-2 border-b px-3 py-2 text-xs font-medium text-muted-foreground">
        <span className="truncate">{title ?? 'untitled'}</span>
        <Button type="button" variant="outline" size="xs" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </figcaption>
      <div
        className="overflow-x-auto text-[13px] leading-6 [&_pre]:m-0 [&_pre]:p-3"
        dangerouslySetInnerHTML={{ __html: htmlMarkup }}
      />
    </figure>
  )
}
