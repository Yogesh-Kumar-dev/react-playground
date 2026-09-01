import { useFormContext } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FieldError } from './FieldError'
import type { FieldSchema } from '../../schema'

interface TextareaFieldProps {
    field: FieldSchema
    disabled?: boolean
}

export function TextareaField({ field, disabled }: TextareaFieldProps) {
    const { register } = useFormContext()

    return (
        <div className="space-y-1.5">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Textarea
                id={field.name}
                placeholder={field.placeholder}
                disabled={disabled}
                {...register(field.name)}
            />
            <FieldError name={field.name} />
        </div>
    )
}
