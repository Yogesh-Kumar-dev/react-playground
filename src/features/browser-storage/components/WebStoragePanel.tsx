import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/features/browser-storage/components/DataTable'
import { FormSheet } from '@/features/browser-storage/components/FormSheet'
import { ScriptGenerator } from '@/features/browser-storage/components/ScriptGenerator'
import { WebStorageForm } from '@/features/browser-storage/components/WebStorageForm'
import type { Features } from '@/features/browser-storage/table-features'
import { useStorageSnapshot } from '@/features/browser-storage/use-storage-snapshot'
import { formatBytes, truncate } from '@/features/browser-storage/utils'
import { useWorkspace } from '@/features/browser-storage/workspace'
import {
    clearEntries,
    entrySize,
    parseSnapshot,
    removeEntry,
    snapshotLocal,
    snapshotSession,
    type WebStorageEntry,
    type WebStorageKind,
} from '@/features/browser-storage/web-storage'

const helper = createColumnHelper<Features, WebStorageEntry>()

const columns = helper.columns([
    helper.accessor('key', {
        header: 'Key',
        cell: (info) => <span className="font-mono text-xs font-medium">{info.getValue()}</span>,
    }),
    helper.accessor('value', {
        header: 'Value',
        enableSorting: false,
        cell: (info) => (
            <span className="font-mono text-xs break-all text-muted-foreground">{truncate(info.getValue(), 160)}</span>
        ),
    }),
    helper.accessor((entry) => entrySize(entry), {
        id: 'size',
        header: 'Size',
        enableGlobalFilter: false,
        sortFn: 'alphanumeric',
        cell: (info) => <span className="text-xs whitespace-nowrap">{formatBytes(info.getValue())}</span>,
    }),
])

const LABELS: Record<WebStorageKind, string> = { local: 'localStorage', session: 'sessionStorage' }

interface EditorState {
    open: boolean
    nonce: number
    entry?: WebStorageEntry
}

export default function WebStoragePanel({ kind }: { kind: WebStorageKind }) {
    const snapshot = useStorageSnapshot(kind === 'local' ? snapshotLocal : snapshotSession)
    const entries = useMemo(() => parseSnapshot(snapshot), [snapshot])
    const totalSize = entries.reduce((sum, entry) => sum + entrySize(entry), 0)
    const [editor, setEditor] = useState<EditorState>({ open: false, nonce: 0 })
    const workspace = useWorkspace()

    const openAdd = () => setEditor((prev) => ({ open: true, nonce: prev.nonce + 1 }))
    const openEdit = (entry: WebStorageEntry) => setEditor((prev) => ({ open: true, nonce: prev.nonce + 1, entry }))
    const close = () => setEditor((prev) => ({ ...prev, open: false }))

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} in {LABELS[kind]} · about{' '}
                {formatBytes(totalSize)} used.{' '}
                {workspace
                    ? 'This is the in-memory copy from the imported snapshot.'
                    : kind === 'local'
                      ? 'Persists until cleared and is shared between tabs of this origin.'
                      : 'Scoped to this tab and cleared when the tab closes.'}
            </p>

            <ScriptGenerator key={kind} defaultTarget={kind} />

            <DataTable
                // Remount when switching between the two stores so table state doesn't leak across.
                key={kind}
                data={entries}
                columns={columns}
                getRowId={(entry) => entry.key}
                searchPlaceholder={`Search ${LABELS[kind]}…`}
                emptyMessage={`${LABELS[kind]} is empty — add an entry.`}
                onRowClick={openEdit}
                onDeleteSelected={(rows) => rows.forEach((row) => removeEntry(kind, row.key))}
                renderRowActions={(entry) => (
                    <>
                        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${entry.key}`} onClick={() => openEdit(entry)}>
                            <Pencil />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${entry.key}`}
                            onClick={() => removeEntry(kind, entry.key)}
                        >
                            <Trash2 />
                        </Button>
                    </>
                )}
                toolbar={
                    <>
                        <Button
                            variant="outline"
                            disabled={entries.length === 0}
                            onClick={() => {
                                if (window.confirm(`Clear all ${entries.length} entries from ${LABELS[kind]}?`)) {
                                    clearEntries(kind)
                                }
                            }}
                        >
                            Clear all
                        </Button>
                        <Button onClick={openAdd}>
                            <Plus />
                            Add entry
                        </Button>
                    </>
                }
            />

            <FormSheet
                open={editor.open}
                onOpenChange={(open) => !open && close()}
                title={editor.entry ? `Edit ${LABELS[kind]} entry` : `Add ${LABELS[kind]} entry`}
            >
                <WebStorageForm key={editor.nonce} kind={kind} original={editor.entry} onDone={close} />
            </FormSheet>
        </div>
    )
}
