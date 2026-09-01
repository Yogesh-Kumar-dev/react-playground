import { useFormContext, Controller } from 'react-hook-form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { FieldLabel } from './FieldLabel'
import { FieldError } from './FieldError'
import type { FieldSchema } from '../../schema'

interface RadioFieldProps {
    field: FieldSchema
    disabled?: boolean
}

export function RadioField({ field, disabled }: RadioFieldProps) {
    const { control } = useFormContext()

    return (
        <div className="space-y-1.5">
            <FieldLabel label={field.label} required={field.required} />
            <Controller
                name={field.name}
                control={control}
                defaultValue={field.defaultValue ?? ''}
                render={({ field: controllerField }) => (
                    <RadioGroup
                        value={controllerField.value}
                        onValueChange={controllerField.onChange}
                        disabled={disabled}
                        className="flex flex-wrap gap-4"
                    >
                        {field.options?.map((opt) => (
                            <div
                                key={opt.value}
                                className="flex items-center gap-2"
                            >
                                <RadioGroupItem
                                    value={opt.value}
                                    id={`${field.name}-${opt.value}`}
                                />
                                <Label
                                    htmlFor={`${field.name}-${opt.value}`}
                                    className="cursor-pointer font-normal"
                                >
                                    {opt.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}
            />
            <FieldError name={field.name} />
        </div>
    )
}
