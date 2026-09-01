import { useFormContext, Controller } from 'react-hook-form'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { FieldError } from './FieldError'
import type { FieldSchema } from '../../schema'

interface SliderFieldProps {
    field: FieldSchema
    disabled?: boolean
}

export function SliderField({ field, disabled }: SliderFieldProps) {
    const { control } = useFormContext()

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label>{field.label}</Label>
                <Controller
                    name={field.name}
                    control={control}
                    defaultValue={field.defaultValue ?? field.min ?? 0}
                    render={({ field: controllerField }) => (
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {String(controllerField.value)}
                        </span>
                    )}
                />
            </div>
            <Controller
                name={field.name}
                control={control}
                defaultValue={field.defaultValue ?? field.min ?? 0}
                render={({ field: controllerField }) => (
                    <Slider
                        value={[controllerField.value as number]}
                        onValueChange={(value) => {
                            const v = Array.isArray(value) ? value[0] : value
                            controllerField.onChange(v)
                        }}
                        min={field.min ?? 0}
                        max={field.max ?? 100}
                        step={field.step ?? 1}
                        disabled={disabled}
                    />
                )}
            />
            <FieldError name={field.name} />
        </div>
    )
}
