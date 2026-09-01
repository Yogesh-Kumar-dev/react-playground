import { useState, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buildStepZodSchema } from '../validation'
import type { FormSchema } from '../schema'

export function useMultiStepForm(schema: FormSchema) {
    const [currentStep, setCurrentStep] = useState(0)
    const [submitted, setSubmitted] = useState(false)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

    const stepSchemas = useMemo(
        () => schema.steps.map((step) => buildStepZodSchema(step)),
        [schema.steps]
    )

    const defaultValues = useMemo(() => {
        const defaults: Record<string, unknown> = {}
        for (const step of schema.steps) {
            for (const item of step.fields) {
                if ('kind' in item && item.kind === 'repeatable') {
                    defaults[item.name] = [{}]
                } else if ('type' in item) {
                    defaults[item.name] = item.defaultValue ?? ''
                }
            }
        }
        return defaults
    }, [schema.steps])

    const resolver = useMemo(
        () => zodResolver(stepSchemas[currentStep]),
        [stepSchemas, currentStep]
    )

    const methods = useForm({
        resolver,
        defaultValues,
        mode: 'onTouched',
    })

    const isLastStep = currentStep === schema.steps.length - 1

    const handleNext = useCallback(async () => {
        const valid = await methods.trigger()
        if (valid && !isLastStep) {
            setCompletedSteps((prev) => new Set(prev).add(currentStep))
            setCurrentStep((prev) => prev + 1)
        }
    }, [methods, isLastStep, currentStep])

    const handlePrevious = useCallback(() => {
        setCurrentStep((prev) => Math.max(0, prev - 1))
    }, [])

    const handleStepClick = useCallback((step: number) => {
        setCurrentStep(step)
    }, [])

    const handleSubmit = useCallback((data: Record<string, unknown>) => {
        setSubmitted(true)
        console.log('Form submitted:', data)
    }, [])

    const handleReset = useCallback(() => {
        setSubmitted(false)
        setCurrentStep(0)
    }, [])

    return {
        currentStep,
        submitted,
        completedSteps,
        isLastStep,
        methods,
        handleNext,
        handlePrevious,
        handleStepClick,
        handleSubmit,
        handleReset,
    }
}
