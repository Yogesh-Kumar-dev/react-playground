import { useFormState } from 'react-hook-form'

export function FieldError({ name }: { name: string }) {
    const { errors } = useFormState({ name })
    const error = errors[name]?.message as string | undefined

    if (!error) return null

    return <p className="text-xs text-destructive">{error}</p>
}
