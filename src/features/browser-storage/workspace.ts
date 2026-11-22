import { useSyncExternalStore } from 'react'
import { MemoryIdb, type MemoryDatabaseData } from '@/features/browser-storage/memory-idb'
import { MemoryStorage } from '@/features/browser-storage/memory-storage'
import type { DecodedSnapshot } from '@/features/browser-storage/snapshot'
import { notifyStorageChanged } from '@/features/browser-storage/use-storage-snapshot'

// A "workspace" is an imported snapshot held in memory. While one is active,
// the Local/Session/IndexedDB tabs read and edit it instead of the browser's
// real storage, which stays untouched.
export interface Workspace {
    source: string
    exportedAt: string
    sections: { localStorage: boolean; sessionStorage: boolean; indexedDB: boolean }
    errors: string[]
    local: MemoryStorage
    session: MemoryStorage
    idb: MemoryIdb
}

let active: Workspace | null = null
const listeners = new Set<() => void>()

export const getWorkspace = () => active

function emit() {
    listeners.forEach((listener) => listener())
    notifyStorageChanged()
}

export function enterWorkspace(snapshot: DecodedSnapshot): Workspace {
    const local = new MemoryStorage()
    for (const entry of snapshot.localStorage ?? []) local.setItem(entry.key, entry.value)
    const session = new MemoryStorage()
    for (const entry of snapshot.sessionStorage ?? []) session.setItem(entry.key, entry.value)

    active = {
        source: snapshot.source,
        exportedAt: snapshot.exportedAt,
        sections: {
            localStorage: snapshot.localStorage !== undefined,
            sessionStorage: snapshot.sessionStorage !== undefined,
            indexedDB: snapshot.indexedDB !== undefined,
        },
        errors: snapshot.errors,
        local,
        session,
        idb: new MemoryIdb(snapshot.indexedDB as MemoryDatabaseData[] | undefined),
    }
    emit()
    return active
}

export function exitWorkspace() {
    active = null
    emit()
}

/** The workspace's current (edited) contents as a snapshot. */
export function workspaceToSnapshot(workspace: Workspace): DecodedSnapshot {
    const entries = (store: MemoryStorage) =>
        Array.from({ length: store.length }, (_, index) => {
            const key = store.key(index)!
            return { key, value: store.getItem(key) ?? '' }
        })
    return {
        source: workspace.source,
        exportedAt: workspace.exportedAt,
        localStorage: entries(workspace.local),
        sessionStorage: entries(workspace.session),
        indexedDB: workspace.idb.toData(),
        errors: [],
    }
}

export function useWorkspace(): Workspace | null {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        getWorkspace,
        () => null,
    )
}
