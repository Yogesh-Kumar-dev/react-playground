import type { ZodType } from 'zod/v4'

export type FieldType =
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'switch'
    | 'slider'
    | 'file'
    | 'color'
    | 'combobox'

export type ConditionalOperator =
    | 'equals'
    | 'notEquals'
    | 'contains'
    | 'greaterThan'
    | 'lessThan'

export interface ConditionalRule {
    field: string
    operator: ConditionalOperator
    value: unknown
}

export interface FieldOption {
    label: string
    value: string
}

export interface FieldSchema {
    name: string
    label: string
    type: FieldType
    placeholder?: string
    required?: boolean
    defaultValue?: unknown
    options?: FieldOption[]
    min?: number
    max?: number
    step?: number
    accept?: string
    multiple?: boolean
    validation: ZodType
    conditional?: ConditionalRule
}

export interface RepeatableGroupSchema {
    kind: 'repeatable'
    name: string
    label: string
    min?: number
    max?: number
    fields: FieldSchema[]
}

export type FieldOrGroup = FieldSchema | RepeatableGroupSchema

export interface StepSchema {
    title: string
    description?: string
    fields: FieldOrGroup[]
}

export interface FormSchema {
    title: string
    description?: string
    steps: StepSchema[]
}
