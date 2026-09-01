import { themeCss } from '@/features/tanstack-highlight/theme'
import { FormProvider } from 'react-hook-form'
import { useMultiStepForm } from '../hooks/useMultiStepForm'
import type { FormSchema } from '../schema'
import { PreviewPanel } from './preview/PreviewPanel'
import { SchemaContext } from './preview/SchemaContext'
import { FormBody } from './steps/FormBody'
import { SubmissionSuccess } from './steps/SubmissionSuccess'

interface DynamicFormProps {
    schema: FormSchema
    showPreview?: boolean
}

export function DynamicForm({ schema, showPreview = true }: Readonly<DynamicFormProps>) {
    const {
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
    } = useMultiStepForm(schema)

    if (submitted) {
        return (
            <SubmissionSuccess
                values={methods.getValues()}
                onReset={handleReset}
            />
        )
    }

    return (
        <FormProvider {...methods}>
            <SchemaContext.Provider value={schema}>
                <div className="p-6" data-hl-theme="carbon">
                    <style>{themeCss}</style>
                    <h1 className="text-2xl font-bold">{schema.title}</h1>
                    <p className="mb-6 text-muted-foreground">
                        {schema.description}
                    </p>

                    <div className={showPreview ? 'grid gap-6 lg:grid-cols-[1fr_300px]' : ''}>
                        <FormBody
                            schema={schema}
                            currentStep={currentStep}
                            isLastStep={isLastStep}
                            completedSteps={completedSteps}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onStepClick={handleStepClick}
                            onSubmit={handleSubmit}
                        />

                        {showPreview && (
                            <div className="hidden lg:block">
                                <PreviewPanel />
                            </div>
                        )}
                    </div>
                </div>
            </SchemaContext.Provider>
        </FormProvider>
    )
}
