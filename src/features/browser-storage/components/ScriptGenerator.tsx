import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { EXPORT_TARGETS, scriptFor, type ExportTarget } from '@/features/browser-storage/export-scripts'
import { useAppForm } from '@/features/browser-storage/form-hook'

const schema = z
    .object({ local: z.boolean(), session: z.boolean(), idb: z.boolean() })
    .refine((value) => value.local || value.session || value.idb, {
        path: ['local'],
        message: 'Pick at least one thing to export',
    })

/**
 * "Get data from another website": choose what to export, get a ready-made
 * script to paste into that site's DevTools console. The resulting JSON file
 * is what the Import button on this page reads.
 */
export function ScriptGenerator({ defaultTarget }: { defaultTarget: ExportTarget }) {
    const [copied, setCopied] = useState(false)

    const form = useAppForm({
        defaultValues: {
            local: defaultTarget === 'local',
            session: defaultTarget === 'session',
            idb: defaultTarget === 'idb',
        },
        validators: { onChange: schema },
    })

    const copy = async (script: string) => {
        try {
            await navigator.clipboard.writeText(script)
        } catch {
            // Clipboard API unavailable (e.g. insecure context): fall back to a hidden textarea.
            const area = document.createElement('textarea')
            area.value = script
            document.body.append(area)
            area.select()
            document.execCommand('copy')
            area.remove()
        }
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
    }

    return (
        <details className="rounded-lg border bg-muted/20 p-3 text-sm">
            <summary className="cursor-pointer font-medium select-none">
                Get data from another website (export script)
            </summary>

            <div className="mt-3 space-y-3">
                <ol className="list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
                    <li>Choose what to export below and copy the script.</li>
                    <li>
                        Open the website you want to copy from, press <kbd>F12</kbd> and open the{' '}
                        <strong>Console</strong> tab.
                    </li>
                    <li>
                        Paste the script and press Enter (if Chrome blocks pasting, type{' '}
                        <code>allow pasting</code> first). A JSON file downloads.
                    </li>
                    <li>
                        Come back here and click <strong>Import</strong> at the top of the page to load that file.
                    </li>
                </ol>

                <form className="flex flex-wrap gap-x-5 gap-y-2" onSubmit={(event) => event.preventDefault()}>
                    {EXPORT_TARGETS.map((target) => (
                        <form.AppField key={target.id} name={target.id}>
                            {(field) => <field.CheckboxField label={target.label} />}
                        </form.AppField>
                    ))}
                </form>

                <form.Subscribe selector={(state) => state.values}>
                    {(values) => {
                        const targets = EXPORT_TARGETS.filter((target) => values[target.id]).map((target) => target.id)
                        const script = scriptFor(targets)
                        if (!script) {
                            return <p className="text-xs text-destructive">Pick at least one thing to export.</p>
                        }
                        return (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-muted-foreground">
                                        {script.split('\n').length} lines · runs entirely in that page, nothing is
                                        uploaded
                                    </span>
                                    <Button size="sm" onClick={() => void copy(script)}>
                                        {copied ? <Check /> : <Copy />}
                                        {copied ? 'Copied' : 'Copy script'}
                                    </Button>
                                </div>
                                <pre
                                    data-testid="export-script"
                                    className="max-h-72 overflow-auto rounded-lg border bg-background p-3 font-mono text-xs leading-relaxed"
                                >
                                    {script}
                                </pre>
                            </div>
                        )
                    }}
                </form.Subscribe>
            </div>
        </details>
    )
}
