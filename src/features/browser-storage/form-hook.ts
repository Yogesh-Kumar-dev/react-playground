import { createFormHook } from '@tanstack/react-form'
import {
    CheckboxField,
    FileField,
    RadioGroupField,
    SelectField,
    SubmitButton,
    TextareaField,
    TextField,
} from '@/features/browser-storage/components/form-fields'
import { fieldContext, formContext } from '@/features/browser-storage/form-context'

// Pre-bound field/form components: `form.AppField` children get typed
// `field.TextField`, `field.SelectField`, … and `form.SubmitButton`.
export const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: { TextField, TextareaField, SelectField, CheckboxField, RadioGroupField, FileField },
    formComponents: { SubmitButton },
})
