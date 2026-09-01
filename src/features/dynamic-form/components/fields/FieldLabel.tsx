import { Label } from '@/components/ui/label'

interface FieldLabelProps {
    label: string
    required?: boolean
    htmlFor?: string
}

export function FieldLabel({ label, required, htmlFor }: FieldLabelProps) {
    return (
        <Label htmlFor={htmlFor}>
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
    )
}
