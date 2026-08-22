import type { QueryClient } from '@tanstack/react-query'
import type { LoaderFunction } from 'react-router-dom'
import { apiPageForViewPage } from '@/features/animechan/pagination'
import { animeListQuery } from '@/features/animechan/query-options'
import { TAB_VALUES } from '@/features/animechan/tab-values'

// Route loader for /animechan. React Router runs it BEFORE the page mounts.
// Only the browse tab is URL-driven and worth pre-fetching: we read the same
// ?search= / ?page= params the page reads (via nuqs), translate the view page
// to the API page exactly like BrowseTab, and ensure the data is cached. The
// random tabs are interactive (fetched on demand / never cached) so they are
// left alone. Other tabs get a free instant render because the loader blocks
// mounting until this cache is warm.
export function animeChanLoader(client: QueryClient): LoaderFunction {
    return async ({ request }) => {
        const url = new URL(request.url)
        const rawTab = url.searchParams.get('tab')
        const tab =
            rawTab !== null && TAB_VALUES.includes(rawTab) ? rawTab : 'browse'

        if (tab === 'browse') {
            const search = (url.searchParams.get('search') ?? '').trim()
            const page = Math.max(
                1,
                Number(url.searchParams.get('page')) || 1
            )
            const apiPage = apiPageForViewPage(page)
            await client.ensureQueryData(
                animeListQuery({ search, page: apiPage })
            )
        }
        return null
    }
}