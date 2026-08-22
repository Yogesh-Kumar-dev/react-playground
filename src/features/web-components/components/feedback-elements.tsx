import React from 'react'
import { createComponent, type EventName } from '@lit/react'
import {
    FeedbackCard as FeedbackCardElement,
    FeedbackModal as FeedbackModalElement,
    type FeedbackSubmitDetail,
} from 'reusable-lit-web-components'

export const FeedbackCard = createComponent({
    tagName: 'feedback-card',
    elementClass: FeedbackCardElement,
    react: React,
})

export const FeedbackModal = createComponent({
    tagName: 'feedback-modal',
    elementClass: FeedbackModalElement,
    react: React,
    events: {
        onFeedbackSubmit: 'feedback-submit' as EventName<
            CustomEvent<FeedbackSubmitDetail>
        >,
        onFeedbackClose: 'feedback-close' as EventName<Event>,
    },
})
