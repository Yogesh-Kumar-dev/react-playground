import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormField } from '../shared/FormField'
import { RepeatableGroup } from '../shared/RepeatableGroup'
import type { FormSchema, FieldSchema } from '../../schema'

interface FormFieldsProps {
    schema: FormSchema
    currentStep: number
    isLastStep: boolean
    onNext: () => void
    onPrevious: () => void
    onSubmit: (data: Record<string, unknown>) => void
}

export function FormFields({
    schema,
    currentStep,
    isLastStep,
    onNext,
    onPrevious,
    onSubmit,
}: Readonly<FormFieldsProps>) {
    const { handleSubmit } = useFormContext()
    const step = schema.steps[currentStep]

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
            <CardHeader>
                <CardTitle>{step.title}</CardTitle>
                {step.description && (
                    <CardDescription>{step.description}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                    {step.fields.map((item) => {
                        if ('kind' in item && item.kind === 'repeatable') {
                            return (
                                <div key={item.name} className="col-span-full">
                                    <RepeatableGroup group={item} />
                                </div>
                            )
                        }
                        return (
                            <FormField
                                key={item.name}
                                field={item as FieldSchema}
                            />
                        )
                    })}
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={onPrevious}
                    disabled={currentStep === 0}
                >
                    Previous
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Step {currentStep + 1} of {schema.steps.length}
                    </span>
                    {isLastStep ? (
                        <Button type="submit" className="cursor-pointer">
                            Submit
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            className="cursor-pointer"
                            onClick={onNext}
                        >
                            Next
                        </Button>
                    )}
                </div>
            </CardFooter>
            </Card>
        </form>
    )
}
