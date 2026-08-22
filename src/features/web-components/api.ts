import axios, { AxiosError } from 'axios'
import { z } from 'zod'
import type { FeedbackSubmitDetail } from 'reusable-lit-web-components'

const API_BASE_URL = 'https://yogesh-kumar-portfolio-v2.vercel.app'

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
})

const feedbackSchema = z.object({
    id: z.string(),
    rating: z.number(),
    message: z.string(),
    source: z.string(),
    context: z.string().optional(),
    createdAt: z.string(),
})
export type Feedback = z.infer<typeof feedbackSchema>

const listResponseSchema = z.object({
    feedback: z.array(feedbackSchema),
    total: z.number(),
})

const createResponseSchema = z.object({
    feedback: feedbackSchema,
})

const errorBodySchema = z.object({
    error: z.string(),
})

const handleError = (error: AxiosError) => {
    const parsed = errorBodySchema.safeParse(error.response?.data)
    if (parsed.success) throw new Error(parsed.data.error)
    if (error.response) {
        throw new Error(
            `API Error: ${error.response.status} - ${error.response.statusText}`
        )
    }
    if (error.request) throw new Error('No response from API server')
    throw new Error(`Request error: ${error.message}`)
}

export const feedbackAPI = {
    async list(): Promise<Feedback[]> {
        try {
            const response = await client.get('/api/feedback')
            return listResponseSchema.parse(response.data).feedback
        } catch (error) {
            if (error instanceof AxiosError) handleError(error)
            throw error
        }
    },

    async create(payload: FeedbackSubmitDetail): Promise<Feedback> {
        try {
            const response = await client.post('/api/feedback', payload)
            return createResponseSchema.parse(response.data).feedback
        } catch (error) {
            if (error instanceof AxiosError) handleError(error)
            throw error
        }
    },
}
