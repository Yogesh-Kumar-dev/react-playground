import { useState, useMemo, useEffect, useContext } from 'react'
import { useFormContext } from 'react-hook-form'
import { highlighter } from '@/features/tanstack-highlight/highlighter'
import { evaluateCondition } from '../../validation'
import { SchemaContext } from './SchemaContext'
import type { FormSchema, FieldOrGroup, ConditionalRule } from '../../schema'

const STEP_COLORS = [
    '#38bdf8',
    '#34d399',
    '#fbbf24',
]

function isVisible(item: FieldOrGroup, values: Record<string, unknown>): boolean {
    if ('kind' in item) return true
    const field = item as FieldOrGroup & { conditional?: ConditionalRule }
    if (!field.conditional) return true
    const fieldValue = values[field.conditional.field]
    return evaluateCondition(field.conditional.operator, fieldValue, field.conditional.value)
}

function getVisibleFieldNames(schema: FormSchema, values: Record<string, unknown>): Set<string> {
    const names = new Set<string>()
    forEachField(schema, (item) => {
        if (isVisible(item, values)) names.add(item.name)
    })
    return names
}

function forEachField(schema: FormSchema, fn: (item: FieldOrGroup, stepIdx: number) => void) {
    schema.steps.forEach((step, stepIdx) => {
        for (const item of step.fields) fn(item, stepIdx)
    })
}

function buildFieldStepMap(schema: FormSchema): Map<string, number> {
    const map = new Map<string, number>()
    forEachField(schema, (item, stepIdx) => {
        map.set(item.name, stepIdx)
        if ('kind' in item) {
            for (const f of item.fields) map.set(f.name, stepIdx)
        }
    })
    return map
}

export function PreviewContent() {
    const schema = useContext(SchemaContext)
    const { watch, getValues } = useFormContext()
    const [values, setValues] = useState(() => getValues())

    useEffect(() => {
        const subscription = watch((value) => {
            setValues(value)
        })
        return () => subscription.unsubscribe()
    }, [watch])

    const fieldStepMap = useMemo(
        () => (schema ? buildFieldStepMap(schema) : new Map()),
        [schema]
    )

    const formatted = useMemo(() => {
        const visibleFields = schema ? getVisibleFieldNames(schema, values) : new Set<string>()
        const filtered = Object.fromEntries(
            Object.entries(values).filter(([key]) => visibleFields.has(key))
        )
        return JSON.stringify(filtered, (_key, value) => {
            if (value instanceof File) {
                return { name: value.name, size: value.size, type: value.type }
            }
            if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
                return value.map((f: File) => ({ name: f.name, size: f.size, type: f.type }))
            }
            return value
        }, 2)
    }, [values, schema])

    const tokens = useMemo(() => {
        return highlighter.highlight(formatted, { lang: 'json' }).tokens
    }, [formatted])

    return (
        <pre className="max-h-[60vh] overflow-auto rounded-lg bg-muted p-3 text-xs font-mono whitespace-pre-wrap break-all">
            <code>
                {tokens.map((token, i) => {
                    const key = token.value.replace(/[""]/g, '')
                    const stepIdx = fieldStepMap.get(key)
                    const color = stepIdx !== undefined ? STEP_COLORS[stepIdx % STEP_COLORS.length] : undefined

                    if (token.className === 'property' && color) {
                        return (
                            <span key={i} style={{ color }}>
                                {token.value}
                            </span>
                        )
                    }
                    return <span key={i}>{token.value}</span>
                })}
            </code>
        </pre>
    )
}
