import { queryOptions } from '@tanstack/react-query'
import { imgflipAPI } from '@/features/imgflip/api'
import { queryKeys } from '@/features/imgflip/query-keys'

// Shared query config for the current top-100 meme templates. Used by both
// the route loader (queryClient.ensureQueryData: cache-first, fetch-on-miss)
// and the <Imgflip /> page (useQuery), so the data is in the cache before the
// component mounts and the page renders without a loading spinner.
export const imgflipMemesQuery = () =>
    queryOptions({
        queryKey: queryKeys.memes.list(),
        queryFn: imgflipAPI.getMemes,
        staleTime: 30 * 60 * 1000,
    })