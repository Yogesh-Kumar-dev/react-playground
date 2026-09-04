import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    VIEW_SIZE,
    apiPageForViewPage,
    viewStartIndex,
} from '@/features/animechan/pagination'
import { animeListQuery } from '@/features/animechan/query-options'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { parseAsInteger, useQueryState } from 'nuqs'
import { useState, type ReactNode } from 'react'
import AnimeDetail from './AnimeDetail'

export default function BrowseTab() {
    const [search, setSearch] = useQueryState('search', { defaultValue: '' })
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
    const [selectedId, setSelectedId] = useState<number | null>(null)

    const debouncedSearch = useDebouncedValue(search.trim(), 400)
    const safePage = Math.max(1, page)
    // The API returns 100 anime per page; translate the view page to the API
    // page and the slice start within it. The route loader reuses these
    // helpers so it pre-fetches exactly the query this component renders.
    const apiPage = apiPageForViewPage(safePage)
    const start = viewStartIndex(safePage)

    const listQuery = useQuery(
        animeListQuery({ search: debouncedSearch, page: apiPage })
    )

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setPage(1)
    }

    const total = listQuery.data?.meta.total ?? 0
    const viewTotalPages = Math.ceil(total / VIEW_SIZE)
    const animes = (listQuery.data?.animes ?? []).slice(
        start,
        start + VIEW_SIZE
    )
    const visibleFrom = start + 1
    const visibleTo = Math.min(start + VIEW_SIZE, total)
    const selectedAnime =
        listQuery.data?.animes.find((a) => a.id === selectedId) ?? null

    let detailContent: ReactNode
    if (listQuery.isPending) {
        detailContent = (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                ))}
            </div>
        )
    } else if (listQuery.isError) {
        detailContent = (
            <p className="text-sm text-destructive">
                {(listQuery.error as Error).message}
            </p>
        )
    } else if (animes.length === 0) {
        detailContent = (
            <p className="py-8 text-center text-sm text-muted-foreground">
                No anime match your search.
            </p>
        )
    } else {
        detailContent = (
            <ul className="space-y-2">
                {animes.map((anime) => {
                    const selected = anime.id === selectedId
                    return (
                        <li key={anime.id}>
                            <button
                                type="button"
                                onClick={() => setSelectedId(anime.id)}
                                className={cn(
                                    'flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors',
                                    selected
                                        ? 'border-ring bg-muted/70'
                                        : 'border-border hover:bg-muted/50'
                                )}
                            >
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium">
                                        {anime.name}
                                    </span>
                                    {anime.altName &&
                                        anime.altName !==
                                            anime.name && (
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {anime.altName}
                                            </span>
                                        )}
                                </span>
                                <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                                    <span>
                                        {anime.episodeCount ?? '?'}{' '}
                                        eps
                                    </span>
                                    <span>
                                        {anime.quoteCount} quotes
                                    </span>
                                </span>
                            </button>
                        </li>
                    )
                })}
            </ul>
        )
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Anime Catalogue</CardTitle>
                    <CardDescription>
                        Search and browse the full anime catalogue.
                    </CardDescription>
                    <div className="space-y-2 pt-2">
                        <Input
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search anime…"
                        />
                        <p className="text-xs text-muted-foreground">
                            {listQuery.data
                                ? `Showing ${visibleFrom}–${visibleTo} of ${total} anime`
                                : 'Loading catalogue…'}
                        </p>
                    </div>
                </CardHeader>

                <CardContent>{detailContent}</CardContent>

                <CardFooter>
                    <div className="flex w-full items-center justify-between gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={safePage <= 1 || listQuery.isPending}
                            onClick={() => setPage(safePage - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Page {safePage} of {viewTotalPages || '…'}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                listQuery.isPending ||
                                !listQuery.data ||
                                safePage >= viewTotalPages
                            }
                            onClick={() => setPage(safePage + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <AnimeDetail anime={selectedAnime} />
        </div>
    )
}