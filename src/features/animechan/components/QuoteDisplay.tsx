import { cn } from '@/lib/utils'
import type { Quote } from '@/features/animechan/api'

interface QuoteDisplayProps {
    quote: Quote
    compact?: boolean
}

export function QuoteDisplay({ quote, compact = false }: QuoteDisplayProps) {
    return (
        <figure className={cn('space-y-1.5', compact && 'py-1')}>
            <blockquote
                className={cn(
                    'border-l-2 border-foreground/25 pl-3 text-sm italic leading-relaxed text-foreground',
                    compact && 'text-[0.9rem]'
                )}
            >
                "{quote.content}"
            </blockquote>
            <figcaption className="text-xs text-muted-foreground">
                — {quote.character.name}{' '}
                <span className="text-muted-foreground/70">
                    ({quote.anime.name})
                </span>
            </figcaption>
        </figure>
    )
}