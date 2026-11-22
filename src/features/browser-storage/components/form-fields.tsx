import type { ReactNode } from 'react'
import { useStore } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useFieldContext, useFormContext } from '@/features/browser-storage/form-context'
import { errorTexts } from '@/features/browser-storage/utils'

function FieldShell({
    label,
    htmlFor,
    hint,
    children,
}: {
    label: string
    htmlFor: string
    hint?: string
    children: ReactNode
}) {
    const field = useFieldContext<unknown>()
    const errors = errorTexts(field.state.meta.errors)
    const showErrors = field.state.meta.isTouched && errors.length > 0

    return (
        <div className="space-y-1.5">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {showErrors ? (
                <p role="alert" className="text-xs text-destructive">
                    {errors.join(' · ')}
                </p>
            ) : field.state.meta.isValidating ? (
                <p className="text-xs text-muted-foreground">Checking…</p>
            ) : hint ? (
                <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
        </div>
    )
}

interface BaseProps {
    label: string
    hint?: string
    disabled?: boolean
}

export function TextField({
    label,
    hint,
    disabled,
    placeholder,
    type = 'text',
}: BaseProps & { placeholder?: string; type?: string }) {
    const field = useFieldContext<string>()
    return (
        <FieldShell label={label} htmlFor={field.name} hint={hint}>
            <Input
                id={field.name}
                name={field.name}
                type={type}
                value={field.state.value}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
            />
        </FieldShell>
    )
}

export function TextareaField({
    label,
    hint,
    disabled,
    rows = 8,
    mono,
}: BaseProps & { rows?: number; mono?: boolean }) {
    const field = useFieldContext<string>()
    return (
        <FieldShell label={label} htmlFor={field.name} hint={hint}>
            <Textarea
                id={field.name}
                name={field.name}
                rows={rows}
                value={field.state.value}
                disabled={disabled}
                spellCheck={false}
                className={mono ? 'font-mono text-xs' : undefined}
                aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
            />
        </FieldShell>
    )
}

export function SelectField({
    label,
    hint,
    disabled,
    options,
}: BaseProps & { options: readonly string[] }) {
    const field = useFieldContext<string>()
    return (
        <FieldShell label={label} htmlFor={field.name} hint={hint}>
            <select
                id={field.name}
                name={field.name}
                value={field.state.value}
                disabled={disabled}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </FieldShell>
    )
}

export function CheckboxField({ label, hint, disabled }: BaseProps) {
    const field = useFieldContext<boolean>()
    const errors = errorTexts(field.state.meta.errors)
    return (
        <div className="space-y-1.5">
            <Label htmlFor={field.name} className="gap-2">
                <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    disabled={disabled}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                />
                {label}
            </Label>
            {errors.length > 0 && field.state.meta.isTouched ? (
                <p role="alert" className="text-xs text-destructive">
                    {errors.join(' · ')}
                </p>
            ) : hint ? (
                <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
        </div>
    )
}

export function RadioGroupField({
    label,
    options,
}: {
    label: string
    options: readonly { value: string; label: string; description: string }[]
}) {
    const field = useFieldContext<string>()
    return (
        <fieldset className="space-y-2">
            <legend className="mb-1.5 text-sm font-medium">{label}</legend>
            {options.map((option) => (
                <label
                    key={option.value}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 text-sm has-checked:border-ring has-checked:bg-muted/50"
                >
                    <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        checked={field.state.value === option.value}
                        onChange={() => field.handleChange(option.value)}
                        className="mt-0.5 accent-primary"
                    />
                    <span className="space-y-0.5">
                        <span className="block font-medium">{option.label}</span>
                        <span className="block text-xs text-muted-foreground">{option.description}</span>
                    </span>
                </label>
            ))}
        </fieldset>
    )
}

export function FileField({ label, hint, accept }: BaseProps & { accept?: string }) {
    const field = useFieldContext<File | null>()
    return (
        <FieldShell label={label} htmlFor={field.name} hint={hint}>
            <Input
                id={field.name}
                name={field.name}
                type="file"
                accept={accept}
                aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.files?.[0] ?? null)}
            />
        </FieldShell>
    )
}

export function SubmitButton({ label }: { label: string }) {
    const form = useFormContext()
    const isSubmitting = useStore(form.store, (state) => state.isSubmitting)
    return (
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : label}
        </Button>
    )
}

export function ErrorBanner({ message }: { message: string | null }) {
    if (!message) return null
    return (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {message}
        </p>
    )
}

export function WarningBanner({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            {children}
        </div>
    )
}
