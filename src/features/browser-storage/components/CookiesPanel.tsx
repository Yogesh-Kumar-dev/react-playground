import { useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CookieForm } from '@/features/browser-storage/components/CookieForm'
import { DataTable } from '@/features/browser-storage/components/DataTable'
import { FormSheet } from '@/features/browser-storage/components/FormSheet'
import {
    defaultCookieInput,
    deleteAllCookies,
    deleteCookie,
    parseCookies,
    readCookieString,
    type CookieEntry,
    type CookieInput,
} from '@/features/browser-storage/cookies'
import type { Features } from '@/features/browser-storage/table-features'
import { useStorageSnapshot } from '@/features/browser-storage/use-storage-snapshot'
import { truncate } from '@/features/browser-storage/utils'

const helper = createColumnHelper<Features, CookieEntry>()

const columns = helper.columns([
    helper.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="font-mono text-xs font-medium">{info.getValue()}</span>,
    }),
    helper.accessor('value', {
        header: 'Value',
        cell: (info) => (
            <span className="font-mono text-xs break-all text-muted-foreground">{truncate(info.getValue(), 120)}</span>
        ),
    }),
])

interface EditorState {
    open: boolean
    /** Bumped on each open so the form remounts with fresh defaults. */
    nonce: number
    entry?: CookieEntry
}

export default function CookiesPanel() {
    const raw = useStorageSnapshot(readCookieString)
    const cookies = useMemo(() => parseCookies(raw), [raw])
    const [editor, setEditor] = useState<EditorState>({ open: false, nonce: 0 })

    const openAdd = () => setEditor((prev) => ({ open: true, nonce: prev.nonce + 1 }))
    const openEdit = (entry: CookieEntry) => setEditor((prev) => ({ open: true, nonce: prev.nonce + 1, entry }))
    const close = () => setEditor((prev) => ({ ...prev, open: false }))

    const initial: CookieInput = editor.entry
        ? { ...defaultCookieInput(), name: editor.entry.name, value: editor.entry.value }
        : defaultCookieInput()

    return (
        <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
                {cookies.length} cookie{cookies.length === 1 ? '' : 's'} visible to JavaScript on this origin.
                HttpOnly cookies are hidden by the browser and can&apos;t be listed or changed here.
            </p>

            <DataTable
                data={cookies}
                columns={columns}
                getRowId={(cookie) => cookie.rawName}
                searchPlaceholder="Search cookies…"
                emptyMessage="No cookies yet — add one."
                onRowClick={openEdit}
                onDeleteSelected={(rows) => rows.forEach((row) => deleteCookie(row.rawName))}
                renderRowActions={(cookie) => (
                    <>
                        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${cookie.name}`} onClick={() => openEdit(cookie)}>
                            <Pencil />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${cookie.name}`}
                            onClick={() => deleteCookie(cookie.rawName)}
                        >
                            <Trash2 />
                        </Button>
                    </>
                )}
                toolbar={
                    <>
                        <Button
                            variant="outline"
                            disabled={cookies.length === 0}
                            onClick={() => {
                                if (window.confirm(`Delete all ${cookies.length} cookies?`)) deleteAllCookies()
                            }}
                        >
                            Clear all
                        </Button>
                        <Button onClick={openAdd}>
                            <Plus />
                            Add cookie
                        </Button>
                    </>
                }
            />

            <FormSheet
                open={editor.open}
                onOpenChange={(open) => !open && close()}
                title={editor.entry ? 'Edit cookie' : 'Add cookie'}
            >
                <CookieForm key={editor.nonce} initial={initial} original={editor.entry} onDone={close} />
            </FormSheet>
        </div>
    )
}
