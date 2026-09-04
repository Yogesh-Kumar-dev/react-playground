
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { animechanAPI, type AnimeSummary } from '@/features/animechan/api'
import { queryKeys } from '@/features/animechan/query-keys'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { QuoteDisplay } from './QuoteDisplay'

interface AnimeDetailProps {
    anime: AnimeSummary | null
}

export default function AnimeDetail({ anime }: Readonly<AnimeDetailProps>) {
    // /anime/:id -> anime info (summary, episode count)
    const detailQuery = useQuery({
        queryKey: queryKeys.anime.detail(anime?.id ?? -1),
        queryFn: () => animechanAPI.getAnimeById(anime!.id),
        enabled: anime != null,
        staleTime: 30 * 60 * 1000,
    })

    // /quotes?anime=X&page=N -> paginated quotes (no meta, so the 404 on the
    // next page is the end signal)
    const quotesQuery = useInfiniteQuery({
        queryKey: queryKeys.quotes.byAnime(anime?.name ?? ''),
        queryFn: ({ pageParam }) =>
            animechanAPI.getQuotes({ anime: anime!.name, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (_lastPage, allPages) => allPages.length + 1,
        enabled: anime != null,
        retry: false,
    })

    if (!anime) {
        return (
            <Card className="h-full">
                <CardContent className="flex h-full min-h-40 items-center justify-center text-center">
                    <p className="text-sm text-muted-foreground">
                        Select an anime from the list to see its details and
                        quotes.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const quotes = quotesQuery.data?.pages.flat() ?? []
    const hasReachedEnd = quotesQuery.isFetchNextPageError

    let nextPageLabel: string
    if (quotesQuery.isFetchingNextPage) {
        nextPageLabel = 'Loading…'
    } else if (hasReachedEnd) {
        nextPageLabel = 'No more quotes'
    } else {
        nextPageLabel = 'Load more quotes'
    }

    let detailContent: ReactNode
    if (detailQuery.isPending) {
        detailContent = (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )
    } else if (detailQuery.isError) {
        detailContent = (
            <p className="text-sm text-destructive">
                {(detailQuery.error as Error).message}
            </p>
        )
    } else {
        detailContent = detailQuery.data && (
            <p className="text-sm leading-relaxed text-muted-foreground">
                {detailQuery.data.summary}
            </p>
        )
    }

    let quotesContent: ReactNode
    if (quotesQuery.isPending) {
        quotesContent = (
            <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )
    } else if (quotesQuery.isError && quotes.length === 0) {
        quotesContent = (
            <p className="text-sm text-destructive">
                {(quotesQuery.error as Error).message}
            </p>
        )
    } else if (quotes.length > 0) {
        quotesContent = (
            <>
                <ul className="space-y-3">
                    {quotes.map((quote, index) => (
                        <li key={`${quote.content}-${index}`}>
                            <QuoteDisplay quote={quote} compact />
                        </li>
                    ))}
                </ul>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={quotesQuery.isFetchingNextPage || hasReachedEnd}
                    onClick={() => quotesQuery.fetchNextPage()}
                >
                    {nextPageLabel}
                </Button>
            </>
        )
    } else {
        quotesContent = (
            <p className="text-sm text-muted-foreground">
                No quotes found for this anime.
            </p>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {detailQuery.data?.name ?? anime.name}
                </CardTitle>
                <CardDescription>
                    {(detailQuery.data?.altName || detailQuery.data?.name) ?? ''}
                    {' · '}
                    {(detailQuery.data?.episodeCount ?? anime.episodeCount) ??
                        '?'}{' '}
                    episodes
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                {detailContent}

                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Quotes</h3>

                    {quotesContent}
                </div>
            </CardContent>
        </Card>
    )
}