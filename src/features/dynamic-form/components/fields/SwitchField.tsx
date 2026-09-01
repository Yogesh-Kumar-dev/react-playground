import { useFormContext, Controller } from 'react-hook-form'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FieldError } from './FieldError'
import type { FieldSchema } from '../../schema'

interface SwitchFieldProps {
    field: FieldSchema
    disabled?: boolean
}

export function SwitchField({ field, disabled }: SwitchFieldProps) {
    const { control } = useFormContext()

    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-3">
                <Controller
                    name={field.name}
                    control={control}
                    defaultValue={field.defaultValue ?? false}
                    render={({ field: controllerField }) => (
                        <Switch
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
