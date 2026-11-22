import { useState } from 'react'
import { Upload } from 'lucide-react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CookiesPanel from '@/features/browser-storage/components/CookiesPanel'
import { FormSheet } from '@/features/browser-storage/components/FormSheet'
import { ImportFlow } from '@/features/browser-storage/components/ImportFlow'
import IndexedDbPanel from '@/features/browser-storage/components/IndexedDbPanel'
import WebStoragePanel from '@/features/browser-storage/components/WebStoragePanel'
import { WorkspaceBanner } from '@/features/browser-storage/components/WorkspaceBanner'
import type { DecodedSnapshot } from '@/features/browser-storage/snapshot'
import { useWorkspace, workspaceToSnapshot } from '@/features/browser-storage/workspace'

const TABS = ['cookies', 'local', 'session', 'indexeddb'] as const

interface ImportState {
    open: boolean
    /** Bumped on each open so the flow remounts from step 1. */
    nonce: number
    preset?: DecodedSnapshot
}

export default function BrowserStoragePage() {
    // Active tab lives in the URL (?tab=…) so a view can be linked/reloaded.
    const [tab, setTab] = useQueryState('tab', parseAsStringLiteral(TABS).withDefault('cookies'))
    const workspace = useWorkspace()
    const [importing, setImporting] = useState<ImportState>({ open: false, nonce: 0 })

    const openImport = (preset?: DecodedSnapshot) =>
        setImporting((prev) => ({ open: true, nonce: prev.nonce + 1, preset }))
    const closeImport = () => setImporting((prev) => ({ ...prev, open: false }))

    return (
        <div className="mx-auto w-full max-w-6xl space-y-4 p-6">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Browser storage</h1>
                    <p className="text-sm text-muted-foreground">
                        Inspect and manage cookies, localStorage, sessionStorage and IndexedDB for{' '}
                        <code>{window.location.origin}</code>. Import a snapshot from another website to explore
                        and edit it here.
                    </p>
                </div>
                <Button variant="outline" onClick={() => openImport()}>
                    <Upload />
                    Import
                </Button>
            </header>

            {workspace && <WorkspaceBanner onSaveToReal={() => openImport(workspaceToSnapshot(workspace))} />}

            <Tabs value={tab} onValueChange={(value) => void setTab(value as (typeof TABS)[number])}>
                <TabsList>
                    <TabsTrigger value="cookies">Cookies</TabsTrigger>
                    <TabsTrigger value="local">Local Storage</TabsTrigger>
                    <TabsTrigger value="session">Session Storage</TabsTrigger>
                    <TabsTrigger value="indexeddb">IndexedDB</TabsTrigger>
                </TabsList>

                <TabsContent value="cookies" className="pt-3">
                    {workspace ? (
                        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                            Cookies aren’t part of snapshots, so there’s nothing to show while a snapshot is open.
                            Exit the snapshot to manage this browser’s real cookies.
                        </p>
                    ) : (
                        <CookiesPanel />
                    )}
                </TabsContent>
                <TabsContent value="local" className="pt-3">
                    <WebStoragePanel kind="local" />
                </TabsContent>
                <TabsContent value="session" className="pt-3">
                    <WebStoragePanel kind="session" />
                </TabsContent>
                <TabsContent value="indexeddb" className="pt-3">
                    <IndexedDbPanel />
                </TabsContent>
            </Tabs>

            <FormSheet
                open={importing.open}
                onOpenChange={(open) => !open && closeImport()}
                title={importing.preset ? 'Write snapshot to real storage' : 'Import a snapshot'}
            >
                <ImportFlow key={importing.nonce} preset={importing.preset} onClose={closeImport} />
            </FormSheet>
        </div>
    )
}
