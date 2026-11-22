import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
    applySnapshotToLive,
    type ApplyReport,
    type ConflictPolicy,
} from '@/features/browser-storage/apply-snapshot'
import { ErrorBanner, WarningBanner } from '@/features/browser-storage/components/form-fields'
import { useAppForm } from '@/features/browser-storage/form-hook'
import { realBackend } from '@/features/browser-storage/indexed-db'
import { resetIdbQueries } from '@/features/browser-storage/queries'
import { MAX_SNAPSHOT_BYTES, parseSnapshot, type DecodedSnapshot } from '@/features/browser-storage/snapshot'
import { enterWorkspace } from '@/features/browser-storage/workspace'
import { errorMessage, formatBytes } from '@/features/browser-storage/utils'

const MODES = [
    {
        value: 'inspect',
        label: 'Inspect in memory',
        description:
            'Load the file into a temporary workspace. Browse and edit it freely — nothing is written to this browser, and it disappears when you exit or reload.',
    },
    {
        value: 'write',
        label: 'Write into this browser’s storage',
        description:
            'Copy the data into this site’s real localStorage, sessionStorage and IndexedDB. You’ll review conflicts before anything is written.',
    },
] as const

// ------------------------------------------------------------------ step 1

function PickStep({
    onInspect,
    onWrite,
    onCancel,
}: {
    onInspect: () => void
    onWrite: (snapshot: DecodedSnapshot) => void
    onCancel: () => void
}) {
    const [submitError, setSubmitError] = useState<string | null>(null)

    const form = useAppForm({
        defaultValues: { mode: 'inspect' as 'inspect' | 'write', file: null as File | null },
        onSubmit: async ({ value }) => {
            try {
                const snapshot = parseSnapshot(await value.file!.text())
                if (value.mode === 'inspect') {
                    enterWorkspace(snapshot)
                    await resetIdbQueries()
                    onInspect()
                } else {
                    onWrite(snapshot)
                }
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
            <p className="text-sm text-muted-foreground">
                Load a snapshot file created by an export script (see “Get data from another website” under the
                Local Storage, Session Storage and IndexedDB tabs). First, decide what should happen to it:
            </p>

            <form.AppField name="mode">
                {(field) => <field.RadioGroupField label="What do you want to do with the file?" options={MODES} />}
            </form.AppField>

            <form.AppField
                name="file"
                validators={{
                    onChange: ({ value }) =>
                        !value
                            ? 'Choose a snapshot file'
                            : value.size > MAX_SNAPSHOT_BYTES
                              ? `This file is ${formatBytes(value.size)}; the limit is ${formatBytes(MAX_SNAPSHOT_BYTES)}.`
                              : undefined,
                }}
            >
                {(field) => (
                    <field.FileField label="Snapshot file" accept=".json,application/json" hint="Read locally in your browser — never uploaded." />
                )}
            </form.AppField>

            <ErrorBanner message={submitError} />

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <form.AppForm>
                    <form.SubmitButton label="Load file" />
                </form.AppForm>
            </div>
        </form>
    )
}

// ------------------------------------------------------------------ step 2

function ApplyStep({
    snapshot,
    onDone,
    onCancel,
}: {
    snapshot: DecodedSnapshot
    onDone: (report: ApplyReport) => void
    onCancel: () => void
}) {
    const [submitError, setSubmitError] = useState<string | null>(null)

    const localCount = snapshot.localStorage?.length ?? 0
    const sessionCount = snapshot.sessionStorage?.length ?? 0
    const databases = snapshot.indexedDB ?? []

    const existing = useQuery({
        queryKey: ['import', 'existing-databases'],
        queryFn: async () => new Set((await realBackend.listDatabases()).map((db) => db.name)),
        staleTime: 0,
        retry: false,
    })

    const localClashes = snapshot.localStorage?.filter((e) => window.localStorage.getItem(e.key) !== null).length ?? 0
    const sessionClashes =
        snapshot.sessionStorage?.filter((e) => window.sessionStorage.getItem(e.key) !== null).length ?? 0
    const dbClashes = databases.filter((db) => existing.data?.has(db.name)).length

    const form = useAppForm({
        // Prefixed names: field names become element ids, and the export script
        // generator on the same page already uses `local` / `session`.
        defaultValues: {
            includeLocal: localCount > 0,
            includeSession: sessionCount > 0,
            includeIndexedDB: databases.length > 0,
            conflict: 'skip' as ConflictPolicy,
        },
        onSubmit: async ({ value }) => {
            try {
                onDone(
                    await applySnapshotToLive(snapshot, {
                        local: value.includeLocal,
                        session: value.includeSession,
                        indexedDB: value.includeIndexedDB,
                        conflict: value.conflict,
                    }),
                )
            } catch (error) {
                setSubmitError(errorMessage(error))
            }
        },
    })

    const records = databases.reduce(
        (sum, db) => sum + db.stores.reduce((inner, store) => inner + store.records.length, 0),
        0,
    )

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault()
                setSubmitError(null)
                void form.handleSubmit()
            }}
        >
            <p className="text-sm text-muted-foreground">
                Snapshot of <code>{snapshot.source}</code>, exported {new Date(snapshot.exportedAt).toLocaleString()}.
                Choose what to write into <strong>this browser’s real storage</strong>:
            </p>

            <div className="space-y-2.5 rounded-lg border p-3">
                {localCount > 0 && (
                    <form.AppField name="includeLocal">
                        {(field) => (
                            <field.CheckboxField
                                label={`Local Storage — ${localCount} entr${localCount === 1 ? 'y' : 'ies'}`}
                                hint={localClashes ? `${localClashes} already exist here` : undefined}
                            />
                        )}
                    </form.AppField>
                )}
                {sessionCount > 0 && (
                    <form.AppField name="includeSession">
                        {(field) => (
                            <field.CheckboxField
                                label={`Session Storage — ${sessionCount} entr${sessionCount === 1 ? 'y' : 'ies'}`}
                                hint={
                                    (sessionClashes ? `${sessionClashes} already exist here. ` : '') +
                                    'Session storage belongs to this tab and is cleared when it closes.'
                                }
                            />
                        )}
                    </form.AppField>
                )}
                {databases.length > 0 && (
                    <form.AppField name="includeIndexedDB">
                        {(field) => (
                            <field.CheckboxField
                                label={`IndexedDB — ${databases.length} database${databases.length === 1 ? '' : 's'}, ${records} record${records === 1 ? '' : 's'}`}
                                hint={dbClashes ? `${dbClashes} already exist here` : undefined}
                            />
                        )}
                    </form.AppField>
                )}
                {localCount + sessionCount + databases.length === 0 && (
                    <p className="text-sm text-muted-foreground">This snapshot contains no data.</p>
                )}
            </div>

            <form.AppField name="conflict">
                {(field) => (
                    <field.SelectField
                        label="If a key or database already exists here"
                        options={['skip', 'overwrite']}
                        hint="skip = keep what’s here · overwrite = replace it (an overwritten database is replaced entirely)"
                    />
                )}
            </form.AppField>

            <WarningBanner>
                Snapshots often contain login tokens and personal data. This writes them into this site’s real
                storage, where scripts on this origin can read them.
            </WarningBanner>

            <ErrorBanner message={submitError} />

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <form.AppForm>
                    <form.SubmitButton label="Write to browser storage" />
                </form.AppForm>
            </div>
        </form>
    )
}

// ------------------------------------------------------------------ step 3

function DoneStep({ report, onClose }: { report: ApplyReport; onClose: () => void }) {
    const failures = [
        ...(report.local?.failed ?? []).map((f) => `localStorage "${f.key}": ${f.error}`),
        ...(report.session?.failed ?? []).map((f) => `sessionStorage "${f.key}": ${f.error}`),
        ...(report.databases?.failed ?? []).map((f) => `IndexedDB "${f.name}": ${f.error}`),
    ]
    const line = (label: string, r?: { written: number; skipped: number }) =>
        r && (
            <li>
                {label}: {r.written} written{r.skipped ? `, ${r.skipped} skipped` : ''}
            </li>
        )

    return (
        <div className="space-y-4">
            <p className="text-sm font-medium">Done — the tabs now show the written data.</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
                {line('Local Storage', report.local)}
                {line('Session Storage', report.session)}
                {report.databases && (
                    <li>
                        IndexedDB: {report.databases.written.length} written
                        {report.databases.skipped.length ? `, ${report.databases.skipped.length} skipped` : ''}
                    </li>
                )}
            </ul>
            {failures.length > 0 && (
                <ErrorBanner message={`Some items could not be written:\n${failures.join('\n')}`} />
            )}
            <div className="flex justify-end">
                <Button onClick={onClose}>Close</Button>
            </div>
        </div>
    )
}

// ------------------------------------------------------------------ flow

type Phase =
    | { kind: 'pick' }
    | { kind: 'apply'; snapshot: DecodedSnapshot }
    | { kind: 'done'; report: ApplyReport }

/**
 * Import: (1) choose inspect-in-memory vs write-to-storage and pick the file,
 * (2) for "write", review what will be written and how conflicts are handled,
 * (3) see the result. `preset` starts at step 2 with already-loaded data
 * (used by “Save to real storage” on an open workspace).
 */
export function ImportFlow({ preset, onClose }: { preset?: DecodedSnapshot; onClose: () => void }) {
    const [phase, setPhase] = useState<Phase>(preset ? { kind: 'apply', snapshot: preset } : { kind: 'pick' })

    if (phase.kind === 'pick') {
        return (
            <PickStep
                onInspect={onClose}
                onWrite={(snapshot) => setPhase({ kind: 'apply', snapshot })}
                onCancel={onClose}
            />
        )
    }
    if (phase.kind === 'apply') {
        return (
            <ApplyStep
                snapshot={phase.snapshot}
                onDone={(report) => {
                    void resetIdbQueries()
                    setPhase({ kind: 'done', report })
                }}
                onCancel={onClose}
            />
        )
    }
    return <DoneStep report={phase.report} onClose={onClose} />
}
