import { createContext } from 'react'
import type { FormSchema } from '../../schema'

export const SchemaContext = createContext<FormSchema | null>(null)
