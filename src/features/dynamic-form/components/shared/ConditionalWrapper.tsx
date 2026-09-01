import { type ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { evaluateCondition } from '../../validation'
import type { ConditionalRule } from '../../schema'

interface ConditionalWrapperProps {
    condition: ConditionalRule
    children: ReactNode
}

export function ConditionalWrapper({
    condition,
    children,
}: Readonly<ConditionalWrapperProps>) {
    const { watch } = useFormContext()
    const fieldValue = watch(condition.field)
    const visible = evaluateCondition(condition.operator, fieldValue, condition.value)

    if (!visible) return null

    return <>{children}</>
}
