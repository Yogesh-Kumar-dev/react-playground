import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { FieldLabel } from './FieldLabel'
import { FieldError } from './FieldError'
import type { FieldSchema } from '../../schema'

interface TextFieldProps {
    field: FieldSchema
    disabled?: boolean
}

export function TextField({ field, disabled }: TextFieldProps) {
    const { register } = useFormContext()

    const autoCompleteMap: Record<string, string> = {
        email: 'one-time-code',
        password: 'new-password',
    }

    return (
        <div className="space-y-1.5">
            <FieldLabel label={field.label} required={field.required} htmlFor={field.name} />
            <Input
                id={field.name}
                type={field.type === 'number' ? 'number' : field.type}
                placeholder={field.placeholder}
                disabled={disabled}
                autoComplete={autoCompleteMap[field.type] ?? 'off'}
                {...register(field.name, {
                    valueAsNumber: field.type === 'number',
                })}
            />
            <FieldError name={field.name} />
        </div>
    )
}
