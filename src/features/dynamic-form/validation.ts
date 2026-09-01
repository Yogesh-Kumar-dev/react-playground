import { z } from 'zod/v4'
import type {
    ConditionalOperator,
    FieldSchema,
    RepeatableGroupSchema,
    StepSchema
} from './schema'

function evaluateCondition(
    operator: ConditionalOperator,
    fieldValue: unknown,
    targetValue: unknown
): boolean {
    switch (operator) {
        case 'equals':
            return fieldValue === targetValue
        case 'notEquals':
            return fieldValue !== targetValue
        case 'contains':
            return String(fieldValue).includes(String(targetValue))
        case 'greaterThan':
            return Number(fieldValue) > Number(targetValue)
        case 'lessThan':
            return Number(fieldValue) < Number(targetValue)
        default:
            return true
    }
}

export { evaluateCondition }

function buildRepeatableGroupZodType(
    group: RepeatableGroupSchema
): z.ZodArray {
    const innerFields: Record<string, z.ZodType> = {}
    for (const field of group.fields) {
        innerFields[field.name] = field.validation
    }
    const itemSchema = z.object(innerFields)
    const min = group.min ?? 0
    const max = group.max ?? Infinity
    let arrSchema = z.array(itemSchema).min(min)
    if (max < Infinity) arrSchema = arrSchema.max(max)
    return arrSchema
}

export function buildStepZodSchema(step: StepSchema): z.ZodObject {
    const shape: Record<string, z.ZodType> = {}

    for (const item of step.fields) {
        if ('kind' in item && item.kind === 'repeatable') {
            shape[item.name] = buildRepeatableGroupZodType(item)
        } else {
            const field = item as FieldSchema
            shape[field.name] = field.validation
        }
    }

    return z.object(shape)
}