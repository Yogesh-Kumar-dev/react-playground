import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
    FeedbackModal as FeedbackModalElement,
    FeedbackSubmitDetail,
    SubmissionState,
} from 'reusable-lit-web-components'
import { feedbackAPI } from '@/features/web-components/api'
import { queryKeys } from '@/features/web-components/query-keys'
import { feedbackListQuery } from '@/features/web-components/query-options'

const FEEDBACK_SOURCE = 'react-playground'
const FEEDBACK_CONTEXT = 'web-components-route'

export function useFeedback() {
    const modalRef = useRef<FeedbackModalElement>(null)
    const queryClient = useQueryClient()
    const listQuery = useQuery(feedbackListQuery())

    const submitMutation = useMutation({
        mutationFn: feedbackAPI.create,
        onSuccess: (saved) => {
            queryClient.setQueryData(
                queryKeys.feedback.list(),
                (current: typeof saved[] | undefined) =>
                    current ? [saved, ...current] : [saved]
            )
        },
    })

    const submissionState: SubmissionState =
        submitMutation.status === 'pending'
            ? 'submitting'
            : submitMutation.status

    const handleFeedbackSubmit = (
        event: CustomEvent<FeedbackSubmitDetail>
    ) => {
        submitMutation.mutate(event.detail)
    }

    const handleFeedbackClose = () => {
        submitMutation.reset()
    }

    const openModal = () => {
        modalRef.current?.show()
    }

    return {
        modalRef,
        items: listQuery.data ?? [],
        listError: listQuery.error instanceof Error ? listQuery.error.message : '',
        isLoading: listQuery.isPending,
        submissionState,
        errorMessage:
            submitMutation.error instanceof Error
                ? submitMutation.error.message
                : '',
        source: FEEDBACK_SOURCE,
        context: FEEDBACK_CONTEXT,
        openModal,
        handleFeedbackSubmit,
        handleFeedbackClose,
    }
}
