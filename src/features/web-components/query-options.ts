import { queryOptions } from '@tanstack/react-query'
import { feedbackAPI } from '@/features/web-components/api'
import { queryKeys } from '@/features/web-components/query-keys'

export const feedbackListQuery = () =>
    queryOptions({
        queryKey: queryKeys.feedback.list(),
        queryFn: feedbackAPI.list,
    })
