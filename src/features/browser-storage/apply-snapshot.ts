import { importDatabaseToReal, realBackend } from '@/features/browser-storage/indexed-db'
import type { DecodedSnapshot } from '@/features/browser-storage/snapshot'
import { notifyStorageChanged } from '@/features/browser-storage/use-storage-snapshot'
import { errorMessage } from '@/features/browser-storage/utils'

export type ConflictPolicy = 'skip' | 'overwrite'

export interface ApplyOptions {
    local: boolean
    session: boolean
    indexedDB: boolean
    conflict: ConflictPolicy
}

export interface WebStorageReport {
    written: number
    skipped: number
    failed: { key: string; error: string }[]
}

export interface DatabasesReport {
    written: string[]
    skipped: string[]
    failed: { name: string; error: string }[]
}

export interface ApplyReport {
    local?: WebStorageReport
    session?: WebStorageReport
    databases?: DatabasesReport
}

function writeWebStorage(
    store: Storage,
    entries: { key: string; value: string }[],
    conflict: ConflictPolicy,
): WebStorageReport {
    const report: WebStorageReport = { written: 0, skipped: 0, failed: [] }
    for (const { key, value } of entries) {
        if (conflict === 'skip' && store.getItem(key) !== null) {
            report.skipped++
            continue
        }
        try {
            store.setItem(key, value) // may throw QuotaExceededError
            report.written++
        } catch (error) {
            report.failed.push({ key, error: errorMessage(error) })
        }
    }
    return report
}

/**
 * Writes a snapshot into the browser's REAL storage (never the in-memory
 * workspace), according to the chosen sections and conflict policy.
 */
export async function applySnapshotToLive(snapshot: DecodedSnapshot, options: ApplyOptions): Promise<ApplyReport> {
    const report: ApplyReport = {}

    if (options.local && snapshot.localStorage) {
        report.local = writeWebStorage(window.localStorage, snapshot.localStorage, options.conflict)
    }
    if (options.session && snapshot.sessionStorage) {
        report.session = writeWebStorage(window.sessionStorage, snapshot.sessionStorage, options.conflict)
    }

    if (options.indexedDB && snapshot.indexedDB) {
        const databases: DatabasesReport = { written: [], skipped: [], failed: [] }
        let existing: Set<string>
        try {
            existing = new Set((await realBackend.listDatabases()).map((db) => db.name))
        } catch (error) {
            for (const db of snapshot.indexedDB) databases.failed.push({ name: db.name, error: errorMessage(error) })
            report.databases = databases
            notifyStorageChanged()
            return report
        }

        for (const database of snapshot.indexedDB) {
            try {
                if (existing.has(database.name)) {
                    if (options.conflict === 'skip') {
                        databases.skipped.push(database.name)
                        continue
                    }
                    await realBackend.deleteDatabase(database.name)
                }
                await importDatabaseToReal(database)
                databases.written.push(database.name)
            } catch (error) {
                // Don't leave a half-written database behind.
                await realBackend.deleteDatabase(database.name).catch(() => undefined)
                databases.failed.push({ name: database.name, error: errorMessage(error) })
            }
        }
        report.databases = databases
    }

    notifyStorageChanged()
    return report
}
