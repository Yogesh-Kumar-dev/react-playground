import type { KeyValueStore } from '@/features/browser-storage/memory-storage'
import { notifyStorageChanged } from '@/features/browser-storage/use-storage-snapshot'
import { getWorkspace } from '@/features/browser-storage/workspace'

export type WebStorageKind = 'local' | 'session'

export interface WebStorageEntry {
    key: string
    value: string
}

// While an imported snapshot is open, reads/writes go to its in-memory copy.
function getStore(kind: WebStorageKind): KeyValueStore {
    const workspace = getWorkspace()
    if (workspace) return kind === 'local' ? workspace.local : workspace.session
    return kind === 'local' ? window.localStorage : window.sessionStorage
}

function readEntries(kind: WebStorageKind): WebStorageEntry[] {
    try {
        const store = getStore(kind)
        const entries: WebStorageEntry[] = []
        for (let i = 0; i < store.length; i++) {
            const key = store.key(i)
            if (key !== null) entries.push({ key, value: store.getItem(key) ?? '' })
        }
        return entries.sort((a, b) => a.key.localeCompare(b.key))
    } catch {
        // Storage can be unavailable (privacy mode, blocked third-party context).
        return []
    }
}

// Module-level so they are stable references for useSyncExternalStore.
export const snapshotLocal = () => JSON.stringify(readEntries('local'))
export const snapshotSession = () => JSON.stringify(readEntries('session'))

export function parseSnapshot(snapshot: string): WebStorageEntry[] {
    return snapshot ? (JSON.parse(snapshot) as WebStorageEntry[]) : []
}

/** Approximate size: JS strings are UTF-16, so 2 bytes per code unit. */
export function entrySize(entry: WebStorageEntry): number {
    return (entry.key.length + entry.value.length) * 2
}

export function hasKey(kind: WebStorageKind, key: string): boolean {
    return getStore(kind).getItem(key) !== null
}

/** Create or update. When `previousKey` differs from `key` the entry is renamed. */
export function saveEntry(kind: WebStorageKind, key: string, value: string, previousKey?: string) {
    if (!key) throw new Error('Key is required.')
    const store = getStore(kind)
    store.setItem(key, value) // may throw QuotaExceededError
    if (previousKey !== undefined && previousKey !== key) store.removeItem(previousKey)
    notifyStorageChanged()
}

export function removeEntry(kind: WebStorageKind, key: string) {
    getStore(kind).removeItem(key)
    notifyStorageChanged()
}

export function clearEntries(kind: WebStorageKind) {
    getStore(kind).clear()
    notifyStorageChanged()
}
