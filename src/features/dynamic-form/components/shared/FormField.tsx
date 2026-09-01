import { TextField } from '../fields/TextField'
import { TextareaField } from '../fields/TextareaField'
import { SelectField } from '../fields/SelectField'
import { CheckboxField } from '../fields/CheckboxField'
import { RadioField } from '../fields/RadioField'
import { SwitchField } from '../fields/SwitchField'
import { SliderField } from '../fields/SliderField'
import { FileUploadField } from '../fields/FileUploadField'
import { ColorPickerField } from '../fields/ColorPickerField'
import { ComboboxField } from '../fields/ComboboxField'
import { ConditionalWrapper } from './ConditionalWrapper'
import type { FieldSchema } from '../../schema'

interface FormFieldProps {
    field: FieldSchema
    name?: string
    disabled?: boolean
}

function FieldRenderer({
    field,
    name,
    disabled,
}: Readonly<{
    field: FieldSchema
    name: string
    disabled?: boolean
}>) {
    const renamedField = name !== field.name ? { ...field, name } : field

    switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
        case 'date':
            return <TextField field={renamedField} disabled={disabled} />
        case 'textarea':
            return <TextareaField field={renamedField} disabled={disabled} />
        case 'select':
            return <SelectField field={renamedField} disabled={disabled} />
        case 'checkbox':
            return <CheckboxField field={renamedField} disabled={disabled} />
        case 'radio':
            return <RadioField field={renamedField} disabled={disabled} />
        case 'switch':
            return <SwitchField field={renamedField} disabled={disabled} />
        case 'slider':
            return <SliderField field={renamedField} disabled={disabled} />
        case 'file':
            return <FileUploadField field={renamedField} disabled={disabled} />
        case 'color':
            return <ColorPickerField field={renamedField} disabled={disabled} />
        case 'combobox':
            return <ComboboxField field={renamedField} disabled={disabled} />
        default:
            return null
    }
}

export function FormField({ field, name, disabled }: Readonly<FormFieldProps>) {
    const fieldName = name ?? field.name

    if (field.conditional) {
        return (
            <ConditionalWrapper condition={field.conditional}>
                <FieldRenderer
                    field={field}
                    name={fieldName}
                    disabled={disabled}
                />
            </ConditionalWrapper>
        )
    }

    return <FieldRenderer field={field} name={fieldName} disabled={disabled} />
}
