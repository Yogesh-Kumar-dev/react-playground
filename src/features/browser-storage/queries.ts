import { queryOptions } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { getSchema, listDatabases, readRecords } from '@/features/browser-storage/indexed-db'

// IndexedDB is external state that other tabs/scripts can change, so these
// queries are always considered stale (mutations invalidate the 'idb' prefix).
export const idbKeys = {
    all: ['idb'] as const,
    databases: () => ['idb', 'databases'] as const,
    schema: (db: string) => ['idb', 'schema', db] as const,
    records: (db: string, store: string, limit: number) => ['idb', 'records', db, store, limit] as const,
    /** Prefix covering every records query of a database (or one of its stores). */
    recordsOf: (db: string, store?: string) =>
        (store === undefined ? ['idb', 'records', db] : ['idb', 'records', db, store]) as readonly string[],
}

export const databasesQuery = () =>
    queryOptions({ queryKey: idbKeys.databases(), queryFn: listDatabases, staleTime: 0, retry: false })

export const schemaQuery = (db: string) =>
    queryOptions({ queryKey: idbKeys.schema(db), queryFn: () => getSchema(db), staleTime: 0, retry: false })

export const recordsQuery = (db: string, store: string, limit: number) =>
    queryOptions({
        queryKey: idbKeys.records(db, store, limit),
        queryFn: () => readRecords(db, store, limit),
        staleTime: 0,
        retry: false,
    })

/** Cached IndexedDB data belongs to whichever backend was active (real vs imported snapshot): start fresh. */
export const resetIdbQueries = () => queryClient.resetQueries({ queryKey: idbKeys.all })
