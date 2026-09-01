import { useFormContext, Controller } from 'react-hook-form'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { FieldLabel } from './FieldLabel'
import { FieldError } from './FieldError'
import type { FieldSchema } from '../../schema'

interface SelectFieldProps {
    field: FieldSchema
    disabled?: boolean
}

export function SelectField({ field, disabled }: SelectFieldProps) {
    const { control } = useFormContext()
    const options = field.options ?? []

    return (
        <div className="space-y-1.5">
            <FieldLabel label={field.label} required={field.required} />
            <Controller
                name={field.name}
                control={control}
                render={({ field: controllerField }) => {
                    const selectedLabel = options.find(o => o.value === controllerField.value)?.label
                    return (
                        <Select
                            value={controllerField.value ?? ''}
                            onValueChange={controllerField.onChange}
                            disabled={disabled}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={field.placeholder ?? 'Select...'}>
                                    {selectedLabel}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )
                }}
            />
            <FieldError name={field.name} />
        </div>
    )
}
