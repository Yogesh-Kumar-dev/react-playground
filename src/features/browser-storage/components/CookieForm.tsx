import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { deleteCookie, setCookie, type CookieEntry, type CookieInput } from '@/features/browser-storage/cookies'
import { useAppForm } from '@/features/browser-storage/form-hook'
import { cookieSchema } from '@/features/browser-storage/schemas'
import { errorMessage } from '@/features/browser-storage/utils'
import { ErrorBanner, WarningBanner } from '@/features/browser-storage/components/form-fields'

export function CookieForm({
    initial,
    original,
    onDone,
}: {
    initial: CookieInput
    /** Present when editing an existing cookie. */
    original?: CookieEntry
    onDone: () => void
}) {
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useAppForm({
        defaultValues: initial,
        validators: { onChange: cookieSchema },
        onSubmit: ({ value }) => {
            try {
                setCookie(value)
                // Renaming = write the new cookie first, then drop the old one,
                // so a rejected write never loses the original.
                if (original && encodeURIComponent(value.name.trim()) !== original.rawName) {
                    deleteCookie(original.rawName)
                }
                onDone()
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
            {original && (
                <WarningBanner>
                    JavaScript can&apos;t read an existing cookie&apos;s path or domain. Saving overwrites it only if
                    the path/domain below match the original; otherwise a second cookie is created.
                </WarningBanner>
            )}

            <form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>
            <form.AppField name="value">
                {(field) => <field.TextareaField label="Value" rows={4} mono />}
            </form.AppField>

            <div className="grid grid-cols-2 gap-3">
                <form.AppField name="path">{(field) => <field.TextField label="Path" />}</form.AppField>
                <form.AppField name="domain">
                    {(field) => <field.TextField label="Domain" placeholder="(current host)" />}
                </form.AppField>
            </div>

            <form.AppField name="expires">
                {(field) => (
                    <field.TextField label="Expires" type="datetime-local" hint="Leave empty for a session cookie." />
                )}
            </form.AppField>

            <div className="grid grid-cols-2 items-end gap-3">
                <form.AppField name="sameSite">
                    {(field) => <field.SelectField label="SameSite" options={['Lax', 'Strict', 'None']} />}
                </form.AppField>
                <form.AppField name="secure">{(field) => <field.CheckboxField label="Secure" />}</form.AppField>
            </div>

            <ErrorBanner message={submitError} />

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onDone}>
                    Cancel
                </Button>
                <form.AppForm>
                    <form.SubmitButton label={original ? 'Save changes' : 'Add cookie'} />
                </form.AppForm>
            </div>
        </form>
    )
}
