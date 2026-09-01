import { StepIndicator } from './StepIndicator'
import { FormFields } from './FormFields'
import type { FormSchema } from '../../schema'

interface FormBodyProps {
    schema: FormSchema
    currentStep: number
    isLastStep: boolean
    completedSteps: Set<number>
    onNext: () => void
    onPrevious: () => void
    onStepClick: (step: number) => void
    onSubmit: (data: Record<string, unknown>) => void
}

export function FormBody({
    schema,
    currentStep,
    isLastStep,
    completedSteps,
    onNext,
    onPrevious,
    onStepClick,
    onSubmit,
}: Readonly<FormBodyProps>) {
    return (
        <div className="space-y-6">
            <StepIndicator
                steps={schema.steps}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={onStepClick}
            />

            <FormFields
                schema={schema}
                currentStep={currentStep}
                isLastStep={isLastStep}
                onNext={onNext}
                onPrevious={onPrevious}
                onSubmit={onSubmit}
            />
        </div>
    )
}
