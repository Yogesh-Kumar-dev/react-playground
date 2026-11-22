import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createDatabase, createStore } from '@/features/browser-storage/indexed-db'
import { useAppForm } from '@/features/browser-storage/form-hook'
import { databaseSchema, storeSchema } from '@/features/browser-storage/schemas'
import { errorMessage } from '@/features/browser-storage/utils'
import { ErrorBanner } from '@/features/browser-storage/components/form-fields'

interface FormProps {
    /** Names already in use, for instant duplicate feedback. */
    existingNames: string[]
    onSaved: () => void
    onCancel: () => void
}

export function StoreForm({ dbName, existingNames, onSaved, onCancel }: FormProps & { dbName: string }) {
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useAppForm({
        defaultValues: { name: '', keyPath: '', autoIncrement: false },
        validators: { onChange: storeSchema },
        onSubmit: async ({ value }) => {
            try {
                await createStore(dbName, value)
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
                Creating a store bumps the database version, which briefly needs every other connection to close.
            </p>
            <form.AppField
                name="name"
                validators={{
                    onChange: ({ value }) =>
                        existingNames.includes(value.trim()) ? 'A store with this name already exists' : undefined,
                }}
            >
                {(field) => <field.TextField label="Store name" />}
            </form.AppField>
            <form.AppField name="keyPath">
                {(field) => (
                    <field.TextField
                        label="Key path"
                        placeholder="(none — keys supplied separately)"
                        hint="A property inside each value, e.g. id. Comma-separate for a compound key: a,b."
                    />
                )}
            </form.AppField>
            <form.AppField name="autoIncrement">
                {(field) => <field.CheckboxField label="Auto-increment keys" />}
            </form.AppField>

            <ErrorBanner message={submitError} />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <form.AppForm>
                    <form.SubmitButton label="Create store" />
                </form.AppForm>
            </div>
        </form>
    )
}

export function DatabaseForm({ existingNames, onSaved, onCancel }: FormProps) {
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useAppForm({
        defaultValues: { name: '', firstStore: '' },
        validators: { onChange: databaseSchema },
        onSubmit: async ({ value }) => {
            try {
                await createDatabase(value.name, value.firstStore)
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
            <form.AppField
                name="name"
                validators={{
                    onChange: ({ value }) =>
                        existingNames.includes(value.trim()) ? 'A database with this name already exists' : undefined,
                }}
            >
                {(field) => <field.TextField label="Database name" />}
            </form.AppField>
            <form.AppField name="firstStore">
                {(field) => (
                    <field.TextField
                        label="First store (optional)"
                        hint="You can add stores later; an empty database is valid."
                    />
                )}
            </form.AppField>

            <ErrorBanner message={submitError} />
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <form.AppForm>
                    <form.SubmitButton label="Create database" />
                </form.AppForm>
            </div>
        </form>
    )
}
