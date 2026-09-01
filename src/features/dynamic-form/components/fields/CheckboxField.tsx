import { useFormContext, Controller } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { FieldError } from './FieldError'
import type { FieldSchema } from '../../schema'

interface CheckboxFieldProps {
    field: FieldSchema
    disabled?: boolean
}

export function CheckboxField({ field, disabled }: CheckboxFieldProps) {
    const { control } = useFormContext()

    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                <Controller
                    name={field.name}
                    control={control}
                    defaultValue={field.defaultValue ?? false}
                    render={({ field: controllerField }) => (
                        <Checkbox
                            id={field.name}
                            checked={controllerField.value}
                            onCheckedChange={controllerField.onChange}
                            disabled={disabled}
                        />
                    )}
                />
                <Label htmlFor={field.name} className="cursor-pointer">
                    {field.label}
                </Label>
            </div>
            <FieldError name={field.name} />
        </div>
    )
}
