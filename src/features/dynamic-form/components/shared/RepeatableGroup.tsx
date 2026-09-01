import { useFieldArray, useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { FormField } from './FormField'
import type { RepeatableGroupSchema } from '../../schema'

interface RepeatableGroupProps {
    group: RepeatableGroupSchema
    disabled?: boolean
}

export function RepeatableGroup({ group, disabled }: RepeatableGroupProps) {
    const { control } = useFormContext()
    const { fields, append, remove } = useFieldArray({
        control,
        name: group.name,
    })

    const min = group.min ?? 0
    const max = group.max ?? Infinity

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{group.label}</Label>
                <span className="text-xs text-muted-foreground">
                    {fields.length} of {max === Infinity ? '∞' : max}
                </span>
            </div>

            <div className="space-y-4">
                {fields.map((field, idx) => (
                    <div
                        key={field.id}
                        className="relative rounded-lg border border-dashed border-input p-4"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                {group.label} #{idx + 1}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => remove(idx)}
                                disabled={disabled || fields.length <= min}
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {group.fields.map((fieldSchema) => (
                                <FormField
                                    key={fieldSchema.name}
                                    field={fieldSchema}
                                    name={`${group.name}.${idx}.${fieldSchema.name}`}
                                    disabled={disabled}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {fields.length < max && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const empty: Record<string, unknown> = {}
                        group.fields.forEach((f) => {
                            empty[f.name] = f.defaultValue ?? ''
                        })
                        append(empty)
                    }}
                    disabled={disabled}
                >
                    <Plus className="size-4 mr-1" />
                    Add {group.label}
                </Button>
            )}
        </div>
    )
}
