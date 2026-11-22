import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { saveRecord, type IdbRecord, type IdbStoreInfo } from '@/features/browser-storage/indexed-db'
import { useAppForm } from '@/features/browser-storage/form-hook'
import { idbRecordSchema } from '@/features/browser-storage/schemas'
import { formatKey, parseKey, serializeValue } from '@/features/browser-storage/serialize'
import { errorMessage } from '@/features/browser-storage/utils'
import { ErrorBanner, WarningBanner } from '@/features/browser-storage/components/form-fields'

export function IdbRecordForm({
    dbName,
    store,
    original,
    onSaved,
    onCancel,
}: {
    dbName: string
    store: IdbStoreInfo
    /** Present when editing. */
    original?: IdbRecord
    onSaved: () => void
    onCancel: () => void
}) {
    const [submitError, setSubmitError] = useState<string | null>(null)

    const inlineKey = store.keyPath !== null
    const editing = original !== undefined
    // Out-of-line keys must be supplied unless the store generates them.
    const keyRequired = !inlineKey && !(store.autoIncrement && !editing)
    const showKey = !inlineKey && !(store.autoIncrement && !editing)

    const serialized = original ? serializeValue(original.value, 2) : null
    const lossy = serialized?.lossy ?? false

    const form = useAppForm({
        defaultValues: {
            keyText: original ? formatKey(original.key) : '',
            valueText: serialized?.text ?? '{}',
            acknowledged: false,
        },
        validators: { onChange: idbRecordSchema },
        onSubmit: async ({ value }) => {
            try {
                await saveRecord(dbName, store.name, {
                    mode: editing ? 'put' : 'add',
                    key: original ? original.key : value.keyText.trim() ? parseKey(value.keyText) : undefined,
                    value: JSON.parse(value.valueText) as unknown,
                })
                onSaved()
            } catch (error) {
                setSubmitError(errorMessage(error))
            }
        },
    })

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault()
                setSubmitError(null)
                void form.handleSubmit()
            }}
        >
            <p className="text-xs text-muted-foreground">
                Store <code>{store.name}</code> ·{' '}
                {inlineKey
                    ? `key is read from "${[store.keyPath].flat().join('", "')}" inside the value`
                    : store.autoIncrement
                      ? 'keys are generated automatically'
                      : 'keys are supplied separately'}
            </p>

            {showKey && (
                <form.AppField
                    name="keyText"
                    validators={{
                        onChange: ({ value }) => {
                            if (keyRequired && !value.trim()) return 'Key is required'
                            try {
                                if (value.trim()) parseKey(value)
                                return undefined
                            } catch (error) {
                                return errorMessage(error)
                            }
                        },
                    }}
                >
                    {(field) => (
                        <field.TextField
                            label="Key"
                            disabled={editing}
                            hint={
                                editing
                                    ? 'A record’s key can’t be changed — delete and re-add instead.'
                                    : 'Plain text is a string key. Use JSON for numbers or arrays: 5, ["a", 1]. Quote to force a string: "5".'
                            }
                        />
                    )}
                </form.AppField>
            )}

            <form.AppField name="valueText">
                {(field) => (
                    <field.TextareaField
                        label="Value (JSON)"
                        rows={12}
                        mono
                        hint={
                            inlineKey && editing
                                ? 'Changing the key path value creates a new record instead of renaming this one.'
                                : undefined
                        }
                    />
                )}
            </form.AppField>

            {lossy && (
                <div className="space-y-2">
                    <WarningBanner>
                        This record contains values JSON can&apos;t represent (dates, Maps, Blobs, …). Saving writes
                        the plain JSON shown above, which changes their type.
                    </WarningBanner>
                    <form.AppField
                        name="acknowledged"
                        validators={{
                            onChange: ({ value }) => (value ? undefined : 'Confirm to save this change'),
                        }}
                    >
                        {(field) => <field.CheckboxField label="I understand — save as plain JSON" />}
                    </form.AppField>
                </div>
            )}

            <ErrorBanner message={submitError} />

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <form.AppForm>
                    <form.SubmitButton label={editing ? 'Save record' : 'Add record'} />
                </form.AppForm>
            </div>
        </form>
    )
}
