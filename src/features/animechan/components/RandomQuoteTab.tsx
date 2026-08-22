'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { animechanAPI } from '@/features/animechan/api'
import { queryKeys } from '@/features/animechan/query-keys'
import { useQuery } from '@tanstack/react-query'
import { QuoteDisplay } from './QuoteDisplay'

type Mode = 'anime' | 'character' | 'random'

const MODE_META: Record<
    Mode,
    {
        title: string
        description: string
        placeholder?: string
        emptyMessage: string
    }
> = {
    anime: {
        title: 'Random Quote by Anime',
        description: 'Enter an anime name to fetch a random quote from it.',
        placeholder: 'e.g. One Punch Man',
        emptyMessage: 'Enter an anime name and press the button to fetch a quote.',
    },
    character: {
        title: 'Random Quote by Character',
        description: 'Enter a character name to fetch a random quote from them.',
        placeholder: 'e.g. Saitama',
        emptyMessage:
            'Enter a character name and press the button to fetch a quote.',
    },
    random: {
        title: 'Random Quote',
        description: 'Fetch a completely random anime quote.',
        emptyMessage: 'Press the button below to fetch a random quote.',
    },
}

interface RandomQuoteTabProps {
    mode: Mode
    /** URL-tracked submitted term (anime/character modes). */
    value?: string
    /** Called on submit to persist the term to the URL. */
    onValueChange?: (value: string) => void
}

export default function RandomQuoteTab({
    mode,
    value = '',
    onValueChange,
}: RandomQuoteTabProps) {
    const meta = MODE_META[mode]
    const [draft, setDraft] = useState(value)

    const isRandom = mode === 'random'
    const submitted = isRandom ? '' : value

    const query = useQuery({
        queryKey: isRandom
            ? queryKeys.quotes.random
            : mode === 'anime'
              ? queryKeys.quotes.randomByAnime(submitted)
              : queryKeys.quotes.randomByCharacter(submitted),
        queryFn: () =>
            isRandom
                ? animechanAPI.getRandomQuote()
                : mode === 'anime'
                  ? animechanAPI.getRandomQuoteByAnime(submitted)
                  : animechanAPI.getRandomQuoteByCharacter(submitted),
        enabled: isRandom ? true : submitted.trim().length > 0,
        staleTime: isRandom ? 0 : undefined,
    })

    const handleSubmit = () => onValueChange?.(draft.trim())

    let content
    if (query.isPending) {
        content = (
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
            </div>
        )
    } else if (query.isError) {
        content = (
            <p className="text-sm text-destructive">
                {(query.error as Error).message}
            </p>
        )
    } else if (query.data) {
        content = <QuoteDisplay quote={query.data} />
    } else {
        content = (
            <p className="text-sm text-muted-foreground">{meta.emptyMessage}</p>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{meta.title}</CardTitle>
                <CardDescription>{meta.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isRandom && (
                    <div className="flex gap-2">
                        <Input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={meta.placeholder}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmit()
                            }}
                        />
                        <Button onClick={handleSubmit}>Get Quote</Button>
                    </div>
                )}
                {content}
                {isRandom && (
                    <Button
                        onClick={() => query.refetch()}
                        disabled={query.isPending}
                        className="w-full"
                    >
                        {query.isPending ? 'Loading…' : 'Get Random Quote'}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}