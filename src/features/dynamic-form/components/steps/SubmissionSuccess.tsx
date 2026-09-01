import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SubmissionSuccessProps {
    values: Record<string, unknown>
    onReset: () => void
}

export function SubmissionSuccess({ values, onReset }: Readonly<SubmissionSuccessProps>) {
    return (
        <div className="p-6">
            <Card>
                <CardContent className="py-12 text-center">
                    <h2 className="text-xl font-bold text-primary">
                        Form Submitted Successfully!
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Check the console for the full form data.
                    </p>
                    <pre className="mt-4 mx-auto max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left text-xs font-mono">
                        {JSON.stringify(values, null, 2)}
                    </pre>
                    <Button className="mt-6" onClick={onReset}>
                        Reset Form
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
