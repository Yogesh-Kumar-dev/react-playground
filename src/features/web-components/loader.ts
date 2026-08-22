import type { QueryClient } from '@tanstack/react-query'
import type { LoaderFunction } from 'react-router-dom'
import { feedbackListQuery } from '@/features/web-components/query-options'

export function webComponentsLoader(client: QueryClient): LoaderFunction {
    return async () => {
        await client.ensureQueryData(feedbackListQuery())
        return null
    }
}
