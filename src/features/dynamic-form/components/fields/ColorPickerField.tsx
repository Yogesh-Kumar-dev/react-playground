import { useFormContext, Controller } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { FieldError } from './FieldError'
import type { FieldSchema } from '../../schema'

interface ColorPickerFieldProps {
    field: FieldSchema
    disabled?: boolean
}

export function ColorPickerField({ field, disabled }: ColorPickerFieldProps) {
    const { control } = useFormContext()

    return (
        <div className="space-y-1.5">
            <Label>{field.label}</Label>
            <Controller
                name={field.name}
                control={control}
                defaultValue={field.defaultValue ?? '#000000'}
                render={({ field: controllerField }) => (
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={controllerField.value}
                            onChange={controllerField.onChange}
                            disabled={disabled}
                            className="size-10 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
                        />
                        <input
                            type="text"
                            value={controllerField.value}
                            onChange={controllerField.onChange}
                            disabled={disabled}
                            className="h-8 w-24 rounded-lg border border-input bg-transparent px-2.5 text-sm font-mono uppercase outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                    </div>
                )}
            />
            <FieldError name={field.name} />
        </div>
    )
}
