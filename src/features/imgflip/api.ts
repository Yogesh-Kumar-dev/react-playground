import axios, { AxiosError } from 'axios'
import { z } from 'zod'

// Imgflip Meme API base URL
const API_BASE_URL = 'https://api.imgflip.com'

// Create axios instance (separate from other features)
const imgflipClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ---- Schemas (types are inferred from these) ----

const memeSchema = z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    width: z.number(),
    height: z.number(),
    box_count: z.number(),
})
export type Meme = z.infer<typeof memeSchema>

// The API wraps successful responses in { success: true, data: { memes: [] } }.
// The docs note extra properties may be added at any time, so unknown keys are
// dropped rather than rejected (non-strict parse).
const getMemesResponseSchema = z.object({
    success: z.literal(true),
    data: z.object({
        memes: z.array(memeSchema),
    }),
})

const parseMemesResponse = (data: unknown): Meme[] =>
    getMemesResponseSchema.parse(data).data.memes

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

// CRUD API functions
export const imgflipAPI = {
    // Get the current top 100 meme templates
    async getMemes(): Promise<Meme[]> {
        let response
        try {
            response = await imgflipClient.get('/get_memes')
        } catch (error) {
            handleError(error as AxiosError)
            throw error
        }
        return parseMemesResponse(response.data)
    },
}