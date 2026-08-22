export const queryKeys = {
    memes: {
        all: ['memes'] as const,
        list: () => [...queryKeys.memes.all, 'list'] as const,
    },
}
