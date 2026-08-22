export const queryKeys = {
    feedback: {
        all: ['feedback'] as const,
        list: () => [...queryKeys.feedback.all, 'list'] as const,
    },
}
