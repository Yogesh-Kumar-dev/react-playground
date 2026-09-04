import axios, { AxiosError } from 'axios'
import { z } from 'zod'

// AnimeChan API base URL
const API_BASE_URL = import.meta.env.VITE_ANIMECHAN_API as string

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ---- Schemas (types are inferred from these) ----

const quoteSchema = z.object({
    content: z.string(),
    character: z.object({
        id: z.number(),
        name: z.string(),
    }),
    anime: z.object({
        id: z.number(),
        name: z.string(),
        altName: z.string().nullable().optional(),
    }),
})
export type Quote = z.infer<typeof quoteSchema>

const animeSummarySchema = z.object({
    id: z.number(),
    name: z.string(),
    altName: z.string().nullable(),
    malId: z.number().nullable(),
    episodeCount: z.number().nullable(),
    quoteCount: z.number(),
})
export type AnimeSummary = z.infer<typeof animeSummarySchema>

const animeInfoSchema = z.object({
    id: z.number(),
    name: z.string(),
    altName: z.string().nullable(),
    episodeCount: z.number().nullable(),
    summary: z.string(),
})
type AnimeInfo = z.infer<typeof animeInfoSchema>

const animeListMetaSchema = z.object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
})
type AnimeListMeta = z.infer<typeof animeListMetaSchema>

// The API wraps every successful response in a { status, data } envelope;
// list endpoints additionally return a sibling `meta` object.
const envelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        status: z.literal('success'),
        data: dataSchema,
    }) as unknown as z.ZodType<{ status: 'success'; data: z.infer<T> }>

const listEnvelopeSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        status: z.literal('success'),
        data: dataSchema,
        meta: animeListMetaSchema,
    }) as unknown as z.ZodType<{
        status: 'success'
        data: z.infer<T>
        meta: AnimeListMeta
    }>

const parseEnvelope = <T extends z.ZodTypeAny>(
    schema: T,
    data: unknown
): z.infer<T> => envelopeSchema(schema).parse(data).data

const parseListEnvelope = <T extends z.ZodTypeAny>(
    schema: T,
    data: unknown
): { data: z.infer<T>; meta: AnimeListMeta } => {
    const { data: items, meta } = listEnvelopeSchema(schema).parse(data)
    return { data: items, meta }
}

// Error handler wrapper (axios / network errors only; schema errors from zod
// propagate as-is so validation failures keep their detailed paths)
const handleError = (error: AxiosError) => {
    if (error.response) {
        throw new Error(
            `API Error: ${error.response.status} - ${error.response.statusText}`
        )
    } else if (error.request) {
        throw new Error('No response from API server')
    } else {
        throw new Error(`Request error: ${error.message}`)
    }
}

type RequestParams = Record<string, string | number | undefined>

const getEnveloped = async <T extends z.ZodTypeAny>(
    url: string,
    schema: T,
    params?: RequestParams
): Promise<z.infer<T>> => {
    let response
    try {
        response = await apiClient.get(url, { params })
    } catch (error) {
        handleError(error as AxiosError)
        throw error
    }
    return parseEnvelope(schema, response.data)
}

const getListEnveloped = async <T extends z.ZodTypeAny>(
    url: string,
    schema: T,
    params?: RequestParams
): Promise<{ data: z.infer<T>; meta: AnimeListMeta }> => {
    let response
    try {
        response = await apiClient.get(url, { params })
    } catch (error) {
        handleError(error as AxiosError)
        throw error
    }
    return parseListEnvelope(schema, response.data)
}

// CRUD API functions
export const animechanAPI = {
    // Get a random anime quote
    async getRandomQuote(): Promise<Quote> {
        return getEnveloped('/quotes/random', quoteSchema)
    },

    // Get a random quote from a given anime name
    async getRandomQuoteByAnime(anime: string): Promise<Quote> {
        return getEnveloped('/quotes/random', quoteSchema, { anime })
    },

    // Get a random quote from a given character name
    async getRandomQuoteByCharacter(character: string): Promise<Quote> {
        return getEnveloped('/quotes/random', quoteSchema, { character })
    },

    // List every anime (search + pagination, 100 per page)
    async getAnimes(
        params: { search?: string; page?: number } = {}
    ): Promise<{ animes: AnimeSummary[]; meta: AnimeListMeta }> {
        const { data, meta } = await getListEnveloped(
            '/anime',
            z.array(animeSummarySchema),
            params
        )
        return { animes: data, meta }
    },

    // Get information of a given anime by id
    async getAnimeById(id: number): Promise<AnimeInfo> {
        return getEnveloped(`/anime/${id}`, animeInfoSchema)
    },

    // Get quotes filtered by anime/character (with pagination, 5 per page)
    async getQuotes(
        params: { anime?: string; character?: string; page?: number } = {}
    ): Promise<Quote[]> {
        return getEnveloped('/quotes', z.array(quoteSchema), params)
    },
}