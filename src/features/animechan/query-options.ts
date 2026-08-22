import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { animechanAPI } from '@/features/animechan/api'
import { queryKeys } from '@/features/animechan/query-keys'

export interface AnimeListParams {
    /** Trimmed search term ('' = whole catalogue). */
    search: string
    /** API page number (100 per page) — see pagination.ts for the view-page translation. */
    page: number
}

// Shared query config for the browse list. Used by both the route loader
// (queryClient.ensureQueryData) and the browse tab (useQuery) with the same
// params derived from the URL, so the loader pre-fills exactly the query the
// component renders and navigation shows data immediately.
export const animeListQuery = ({ search, page }: AnimeListParams) =>
    queryOptions({
        queryKey: queryKeys.animes.list({ search, page }),
        queryFn: () =>
            animechanAPI.getAnimes({ search: search || undefined, page }),
        placeholderData: keepPreviousData,
        staleTime: 10 * 60 * 1000,
    })