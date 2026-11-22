import { useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { useAppForm } from '@/features/browser-storage/form-hook'
import { storageEntrySchema } from '@/features/browser-storage/schemas'
import { errorMessage, tryFormatJson } from '@/features/browser-storage/utils'
import { hasKey, saveEntry, type WebStorageEntry, type WebStorageKind } from '@/features/browser-storage/web-storage'
import { ErrorBanner } from '@/features/browser-storage/components/form-fields'

export function WebStorageForm({
    kind,
    original,
    onDone,
}: {
    kind: WebStorageKind
    /** Present when editing. */
    original?: WebStorageEntry
    onDone: () => void
}) {
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useAppForm({
        defaultValues: { key: original?.key ?? '', value: original?.value ?? '' },
        validators: { onChange: storageEntrySchema },
        onSubmit: ({ value }) => {
            try {
                saveEntry(kind, value.key, value.value, original?.key)
                onDone()
            } catch (error) {
                // e.g. QuotaExceededError
                setSubmitError(errorMessage(error))
            }
        },
    })

    const currentValue = useStore(form.store, (state) => state.values.value)
    const formatted = tryFormatJson(currentValue)

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault()
                setSubmitError(null)
                void form.handleSubmit()
            }}
        >
            <form.AppField
                name="key"
                validators={{
                    onChangeAsyncDebounceMs: 250,
                    onChangeAsync: async ({ value }) => {
                        if (!value || value === original?.key) return undefined
                        return hasKey(kind, value)
                            ? original
                                ? 'Another entry already uses this key.'
                                : 'This key already exists — editing it would overwrite the value.'
                            : undefined
                    },
                }}
            >
                {(field) => <field.TextField label="Key" />}
            </form.AppField>

            <form.AppField name="value">
                {(field) => <field.TextareaField label="Value" rows={10} mono />}
            </form.AppField>

            {formatted !== null && formatted !== currentValue && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => form.setFieldValue('value', formatted)}
                >
                    Format JSON
                </Button>
            )}

            <ErrorBanner message={submitError} />

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onDone}>
                    Cancel
                </Button>
                <form.AppForm>
                    <form.SubmitButton label={original ? 'Save changes' : 'Add entry'} />
                </form.AppForm>
            </div>
        </form>
    )
}
