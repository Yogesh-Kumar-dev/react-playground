import { Download, HardDriveDownload, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resetIdbQueries } from '@/features/browser-storage/queries'
import { downloadText, encodeSnapshot } from '@/features/browser-storage/snapshot'
import { exitWorkspace, useWorkspace, workspaceToSnapshot } from '@/features/browser-storage/workspace'
import { errorMessage } from '@/features/browser-storage/utils'
import { useState } from 'react'

/** Shown while an imported snapshot is open in memory. */
export function WorkspaceBanner({ onSaveToReal }: { onSaveToReal: () => void }) {
    const workspace = useWorkspace()
    const [error, setError] = useState<string | null>(null)
    if (!workspace) return null

    const sections = [
        workspace.sections.localStorage && 'Local Storage',
        workspace.sections.sessionStorage && 'Session Storage',
        workspace.sections.indexedDB && 'IndexedDB',
    ].filter(Boolean)

    const download = async () => {
        try {
            const snapshot = workspaceToSnapshot(workspace)
            const host = workspace.source.replace(/^[a-z]+:\/\//i, '').replace(/[^a-z0-9.-]/gi, '_') || 'snapshot'
            downloadText(`storage-${host}-edited.json`, await encodeSnapshot(snapshot))
        } catch (e) {
            setError(errorMessage(e))
        }
    }

    return (
        <div
            role="status"
            data-testid="workspace-banner"
            className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
        >
            <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-amber-700 dark:text-amber-400">
                    Inspecting a snapshot of <code>{workspace.source}</code>
                </p>
                <span className="text-xs text-muted-foreground">
                    exported {new Date(workspace.exportedAt).toLocaleString()} · {sections.join(', ') || 'no data'}
                </span>
                <div className="ml-auto flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => void download()}>
                        <Download />
                        Download JSON
                    </Button>
                    <Button size="sm" variant="outline" onClick={onSaveToReal}>
                        <HardDriveDownload />
                        Write to real storage…
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            exitWorkspace()
                            void resetIdbQueries()
                        }}
                    >
                        <LogOut />
                        Exit snapshot
                    </Button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Everything below is an in-memory copy — add, edit and delete freely. Your browser’s real storage is
                untouched, and this copy is lost on reload unless you download or write it. Cookies aren’t part of
                snapshots.
            </p>
            {workspace.errors.length > 0 && (
                <p className="text-xs text-destructive">Export script warnings: {workspace.errors.join(' · ')}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}

