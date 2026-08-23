'use client'

import { Button } from '@/components/ui/button'
import FeedbackList from '@/features/web-components/components/FeedbackList'
import { FeedbackModal } from '@/features/web-components/components/feedback-elements'
import { useFeedback } from '@/features/web-components/use-feedback'

export default function WebComponents() {
    const {
        modalRef,
        items,
        listError,
        isLoading,
        submissionState,
        errorMessage,
        source,
        context,
        openModal,
        handleFeedbackSubmit,
        handleFeedbackClose,
    } = useFeedback()

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Web Components</h1>
                    <p className="mt-1 max-w-2xl text-muted-foreground">
                        The feedback modal is a web component from{' '}
                        <a
                            href="https://github.com/Yogesh-Kumar-dev/web-components/tree/main/src/components"
                            className="underline underline-offset-4 hover:text-foreground"
                            target="_blank"
                            rel="noreferrer"
                        >
                            this Lit collection
                        </a>
                        . Instead of shadcn, Lit web components
                        (<code>feedback-modal</code> and{' '}
                        <code>feedback-card</code>) are used for the
                        presentational UI. The write-up for this setup is{' '}
                        <a
                            href="https://quickrecall.vercel.app/articles/web-components-enterprise-design-systems"
                            className="underline underline-offset-4 hover:text-foreground"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Web Components in Enterprise Applications
                        </a>
                        .
                    </p>
                </div>
                <Button type="button" onClick={openModal}>
                    Give feedback
                </Button>
            </div>

            <FeedbackList
                items={items}
                listError={listError}
                isLoading={isLoading}
            />

            <FeedbackModal
                ref={modalRef}
                source={source}
                context={context}
                submissionState={submissionState}
                errorMessage={errorMessage}
                onFeedbackSubmit={handleFeedbackSubmit}
                onFeedbackClose={handleFeedbackClose}
            />
        </div>
    )
}
