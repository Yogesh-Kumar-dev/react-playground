import { DynamicForm } from './components/DynamicForm'
import { contactFormSchema } from './form-schemas'

export default function DynamicFormPage() {
    return <DynamicForm schema={contactFormSchema} />
}
