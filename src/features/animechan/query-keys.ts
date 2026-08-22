export const queryKeys = {
    animes: {
        all: ['animes'] as const,
        list: (params: { search: string; page: number }) =>
            [...queryKeys.animes.all, 'list', params] as const,
    },
    anime: {
        all: ['anime'] as const,
        detail: (id: number) =>
            [...queryKeys.anime.all, 'detail', id] as const,
    },
    quotes: {
        all: ['quotes'] as const,
        byAnime: (anime: string) =>
            [...queryKeys.quotes.all, 'by-anime', anime] as const,
        random: ['quotes', 'random'] as const,
        randomByAnime: (anime: string) =>
            [...queryKeys.quotes.all, 'random', 'anime', anime] as const,
        randomByCharacter: (character: string) =>
            [...queryKeys.quotes.all, 'random', 'character', character] as const,
    },
}
