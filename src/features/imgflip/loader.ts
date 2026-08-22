import type { QueryClient } from '@tanstack/react-query'
import type { LoaderFunction } from 'react-router-dom'
import { imgflipMemesQuery } from '@/features/imgflip/query-options'

// Route loader for /imgflip. React Router runs it BEFORE the page mounts, so
// "ensureQueryData" returns instantly when fresh data is already cached, or
// fetches + caches it when it is missing/stale. The page's useQuery then
// finds the data in the cache and renders immediately — no spinner.
export function imgflipLoader(client: QueryClient): LoaderFunction {
    return async () => {
        await client.ensureQueryData(imgflipMemesQuery())
        return null
    }
}