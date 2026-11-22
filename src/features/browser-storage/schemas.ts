import { z } from 'zod'
import { isValidJson } from '@/features/browser-storage/utils'

// Zod 4 implements Standard Schema, so TanStack Form accepts these directly as
// form-level validators and routes each issue to the field named by its path.

export const cookieSchema = z
    .object({
        name: z.string().trim().min(1, 'Name is required'),
        value: z.string(),
        path: z.string().trim().refine((path) => path === '' || path.startsWith('/'), 'Path must start with "/"'),
        domain: z
            .string()
            .trim()
            .refine(
                (domain) => domain === '' || /^\.?[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(domain),
                'Enter a hostname like example.com',
            ),
        expires: z.string().refine((value) => value === '' || !Number.isNaN(new Date(value).getTime()), 'Invalid date'),
        sameSite: z.enum(['Lax', 'Strict', 'None']),
        secure: z.boolean(),
    })
    .superRefine((cookie, ctx) => {
        if (cookie.sameSite === 'None' && !cookie.secure) {
            ctx.addIssue({ code: 'custom', path: ['secure'], message: 'SameSite=None requires Secure' })
        }
    })

export const storageEntrySchema = z.object({
    key: z.string().min(1, 'Key is required'),
    value: z.string(),
})

// Key and acknowledgement rules depend on the store, so they live on their
// fields in the form; the schema covers the shape plus the JSON check.
export const idbRecordSchema = z.object({
    keyText: z.string(),
    valueText: z.string().refine(isValidJson, 'Value must be valid JSON'),
    acknowledged: z.boolean(),
})

export const storeSchema = z
    .object({
        name: z.string().trim().min(1, 'Store name is required'),
        keyPath: z.string().trim(),
        autoIncrement: z.boolean(),
    })
    .superRefine((store, ctx) => {
        if (store.autoIncrement && store.keyPath.includes(',')) {
            ctx.addIssue({
                code: 'custom',
                path: ['autoIncrement'],
                message: 'Auto-increment can’t be used with a compound key path',
            })
        }
    })

export const databaseSchema = z.object({
    name: z.string().trim().min(1, 'Database name is required'),
    firstStore: z.string().trim(),
})
