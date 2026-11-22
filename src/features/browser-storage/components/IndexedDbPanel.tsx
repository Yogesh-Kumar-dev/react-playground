import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createColumnHelper } from '@tanstack/react-table'
import { Database, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/features/browser-storage/components/DataTable'
import { FormSheet } from '@/features/browser-storage/components/FormSheet'
import { ErrorBanner } from '@/features/browser-storage/components/form-fields'
import { ScriptGenerator } from '@/features/browser-storage/components/ScriptGenerator'
import { IdbRecordForm } from '@/features/browser-storage/components/IdbRecordForm'
import { DatabaseForm, StoreForm } from '@/features/browser-storage/components/IdbStructureForms'
import {
    clearStore,
    deleteDatabase,
    deleteRecords,
    deleteStore,
    type IdbDatabaseInfo,
    type IdbRecord,
    type IdbSchema,
} from '@/features/browser-storage/indexed-db'
import { databasesQuery, idbKeys, recordsQuery, schemaQuery } from '@/features/browser-storage/queries'
import { formatKey, serializeValue } from '@/features/browser-storage/serialize'
import type { Features } from '@/features/browser-storage/table-features'
import { errorMessage, truncate } from '@/features/browser-storage/utils'

const PAGE = 100

const helper = createColumnHelper<Features, IdbRecord>()

const columns = helper.columns([
    helper.accessor((record) => formatKey(record.key), {
        id: 'key',
        header: 'Key',
        cell: (info) => <span className="font-mono text-xs font-medium">{info.getValue()}</span>,
    }),
    helper.accessor((record) => serializeValue(record.value).text, {
        id: 'value',
        header: 'Value',
        enableSorting: false,
        cell: (info) => (
            <span className="font-mono text-xs break-all text-muted-foreground">{truncate(info.getValue(), 200)}</span>
        ),
    }),
])

const recordId = (record: IdbRecord) => `${typeof record.key}:${formatKey(record.key)}`

type Sheet =
    | { kind: 'record'; nonce: number; record?: IdbRecord }
    | { kind: 'store'; nonce: number }
    | { kind: 'database'; nonce: number }

export default function IndexedDbPanel() {
    const queryClient = useQueryClient()
    const [selectedDb, setSelectedDb] = useState<string | null>(null)
    const [selectedStore, setSelectedStore] = useState<string | null>(null)
    const [limit, setLimit] = useState(PAGE)
    const [sheet, setSheet] = useState<(Sheet & { open: boolean }) | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    const databases = useQuery(databasesQuery())
    // Fall back to the first database/store when the selection no longer exists.
    const dbName =
        databases.data?.find((db) => db.name === selectedDb)?.name ?? databases.data?.[0]?.name ?? null

    const schema = useQuery({ ...schemaQuery(dbName ?? ''), enabled: dbName !== null })
    const store =
        schema.data?.stores.find((candidate) => candidate.name === selectedStore) ?? schema.data?.stores[0] ?? null

    const records = useQuery({
        ...recordsQuery(dbName ?? '', store?.name ?? '', limit),
        enabled: dbName !== null && store !== null,
    })

    const refresh = () => queryClient.invalidateQueries({ queryKey: idbKeys.all })

    const action = useMutation({
        mutationFn: (run: () => Promise<unknown>) => run(),
        onMutate: () => setActionError(null),
        onSuccess: refresh,
        onError: (error) => setActionError(errorMessage(error)),
    })

    // Deleting a database/store: drop it from the cache *before* refetching, so
    // no query (schema/records) is re-run against something that is gone.
    const removeDatabase = useMutation({
        mutationFn: (name: string) => deleteDatabase(name),
        onMutate: () => setActionError(null),
        onSuccess: async (_result, name) => {
            queryClient.setQueryData<IdbDatabaseInfo[]>(idbKeys.databases(), (old) =>
                old?.filter((db) => db.name !== name),
            )
            queryClient.removeQueries({ queryKey: idbKeys.schema(name) })
            queryClient.removeQueries({ queryKey: idbKeys.recordsOf(name) })
            await refresh()
        },
        onError: (error) => setActionError(errorMessage(error)),
    })

    const removeStore = useMutation({
        mutationFn: ({ db, store: storeName }: { db: string; store: string }) => deleteStore(db, storeName),
        onMutate: () => setActionError(null),
        onSuccess: async (_result, { db, store: storeName }) => {
            queryClient.setQueryData<IdbSchema>(idbKeys.schema(db), (old) =>
                old && { ...old, stores: old.stores.filter((candidate) => candidate.name !== storeName) },
            )
            queryClient.removeQueries({ queryKey: idbKeys.recordsOf(db, storeName) })
            await refresh()
        },
        onError: (error) => setActionError(errorMessage(error)),
    })

    const openSheet = (next: Sheet) => setSheet({ ...next, open: true })
    const closeSheet = () => setSheet((prev) => (prev ? { ...prev, open: false } : prev))
    const saved = () => {
        closeSheet()
        void refresh()
    }
    const nextNonce = () => (sheet?.nonce ?? 0) + 1

    if (databases.isError) {
        return (
            <div className="space-y-3">
                <ErrorBanner message={errorMessage(databases.error)} />
                <ScriptGenerator defaultTarget="idb" />
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <ScriptGenerator defaultTarget="idb" />
            <ErrorBanner message={actionError} />

            <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
                {/* ------------------------------------------------ databases */}
                <aside className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium">Databases</h2>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon-sm" aria-label="Refresh" onClick={() => void refresh()}>
                                <RefreshCw className={databases.isFetching ? 'animate-spin' : undefined} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="New database"
                                onClick={() => openSheet({ kind: 'database', nonce: nextNonce() })}
                            >
                                <Plus />
                            </Button>
                        </div>
                    </div>

                    {databases.isPending ? (
                        <p className="text-sm text-muted-foreground">Loading…</p>
                    ) : databases.data.length === 0 ? (
                        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                            No IndexedDB databases on this origin yet.
                        </p>
                    ) : (
                        <ul className="space-y-1">
                            {databases.data.map((db) => (
                                <li key={db.name}>
                                    <button
                                        type="button"
                                        aria-current={db.name === dbName}
                                        onClick={() => {
                                            setSelectedDb(db.name)
                                            setSelectedStore(null)
                                            setLimit(PAGE)
                                        }}
                                        className="flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-sm hover:bg-muted aria-[current=true]:border-ring aria-[current=true]:bg-muted"
                                    >
                                        <Database className="size-4 shrink-0 text-muted-foreground" />
                                        <span className="truncate font-mono text-xs">{db.name}</span>
                                        <span className="ml-auto text-xs text-muted-foreground">v{db.version}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </aside>

                {/* ------------------------------------------------ stores + records */}
                <section className="min-w-0 space-y-3">
                    {dbName === null ? (
                        <p className="text-sm text-muted-foreground">Create a database to get started.</p>
                    ) : schema.isError ? (
                        <ErrorBanner message={errorMessage(schema.error)} />
                    ) : schema.isPending ? (
                        <p className="text-sm text-muted-foreground">Loading schema…</p>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-mono text-sm font-medium">{schema.data.name}</h2>
                                <span className="text-xs text-muted-foreground">version {schema.data.version}</span>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="ml-auto"
                                    onClick={() => {
                                        if (window.confirm(`Delete database "${dbName}" and all its data?`)) {
                                            setSelectedStore(null)
                                            removeDatabase.mutate(dbName)
                                        }
                                    }}
                                >
                                    <Trash2 />
                                    Delete database
                                </Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                                {schema.data.stores.map((candidate) => (
                                    <Button
                                        key={candidate.name}
                                        size="sm"
                                        variant={candidate.name === store?.name ? 'default' : 'outline'}
                                        onClick={() => {
                                            setSelectedStore(candidate.name)
                                            setLimit(PAGE)
                                        }}
                                    >
                                        {candidate.name}
                                        <span className="opacity-70">{candidate.count}</span>
                                    </Button>
                                ))}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openSheet({ kind: 'store', nonce: nextNonce() })}
                                >
                                    <Plus />
                                    New store
                                </Button>
                            </div>

                            {store === null ? (
                                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                    This database has no object stores yet.
                                </p>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span>
                                            Key path:{' '}
                                            <code>
                                                {store.keyPath === null ? '— (out-of-line)' : [store.keyPath].flat().join(', ')}
                                            </code>
                                        </span>
                                        <span>Auto-increment: {store.autoIncrement ? 'yes' : 'no'}</span>
                                        <span>
                                            Indexes:{' '}
                                            {store.indexes.length === 0
                                                ? 'none'
                                                : store.indexes
                                                      .map((index) => `${index.name}${index.unique ? ' (unique)' : ''}`)
                                                      .join(', ')}
                                        </span>
                                        <span className="ml-auto flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="xs"
                                                disabled={store.count === 0}
                                                onClick={() => {
                                                    if (window.confirm(`Delete all ${store.count} records in "${store.name}"?`)) {
                                                        action.mutate(() => clearStore(dbName, store.name))
                                                    }
                                                }}
                                            >
                                                Clear store
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="xs"
                                                onClick={() => {
                                                    if (window.confirm(`Delete store "${store.name}" and its records?`)) {
                                                        setSelectedStore(null)
                                                        removeStore.mutate({ db: dbName, store: store.name })
                                                    }
                                                }}
                                            >
                                                Delete store
                                            </Button>
                                        </span>
                                    </div>

                                    {records.isError ? (
                                        <ErrorBanner message={errorMessage(records.error)} />
                                    ) : (
                                        <DataTable
                                            // Fresh table state (page, sort, selection) per store.
                                            key={`${dbName}/${store.name}`}
                                            data={records.data?.records ?? EMPTY}
                                            columns={columns}
                                            getRowId={recordId}
                                            searchPlaceholder="Search loaded records…"
                                            emptyMessage={records.isPending ? 'Loading…' : 'No records — add one.'}
                                            onRowClick={(record) =>
                                                openSheet({ kind: 'record', nonce: nextNonce(), record })
                                            }
                                            onDeleteSelected={(rows) =>
                                                action.mutate(() =>
                                                    deleteRecords(dbName, store.name, rows.map((row) => row.key)),
                                                )
                                            }
                                            renderRowActions={(record) => (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label="Edit record"
                                                        onClick={() =>
                                                            openSheet({ kind: 'record', nonce: nextNonce(), record })
                                                        }
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label="Delete record"
                                                        onClick={() =>
                                                            action.mutate(() =>
                                                                deleteRecords(dbName, store.name, [record.key]),
                                                            )
                                                        }
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </>
                                            )}
                                            toolbar={
                                                <>
                                                    {records.data?.truncated && (
                                                        <Button variant="outline" onClick={() => setLimit(limit + PAGE)}>
                                                            Load more ({records.data.records.length} of {store.count})
                                                        </Button>
                                                    )}
                                                    <Button
                                                        onClick={() => openSheet({ kind: 'record', nonce: nextNonce() })}
                                                    >
                                                        <Plus />
                                                        Add record
                                                    </Button>
                                                </>
                                            }
                                        />
                                    )}
                                </>
                            )}
                        </>
                    )}
                </section>
            </div>

            <FormSheet
                open={sheet?.open ?? false}
                onOpenChange={(open) => !open && closeSheet()}
                title={
                    sheet?.kind === 'database'
                        ? 'New database'
                        : sheet?.kind === 'store'
                          ? 'New object store'
                          : sheet?.kind === 'record' && sheet.record
                            ? 'Edit record'
                            : 'Add record'
                }
            >
                {sheet?.kind === 'database' && (
                    <DatabaseForm
                        key={sheet.nonce}
                        existingNames={databases.data?.map((db) => db.name) ?? []}
                        onSaved={() => {
                            saved()
                        }}
                        onCancel={closeSheet}
                    />
                )}
                {sheet?.kind === 'store' && dbName !== null && (
                    <StoreForm
                        key={sheet.nonce}
                        dbName={dbName}
                        existingNames={schema.data?.stores.map((candidate) => candidate.name) ?? []}
                        onSaved={saved}
                        onCancel={closeSheet}
                    />
                )}
                {sheet?.kind === 'record' && dbName !== null && store !== null && (
                    <IdbRecordForm
                        key={sheet.nonce}
                        dbName={dbName}
                        store={store}
                        original={sheet.record}
                        onSaved={saved}
                        onCancel={closeSheet}
                    />
                )}
            </FormSheet>
        </div>
    )
}

// Stable empty array so DataTable's `data` input doesn't change identity while loading.
const EMPTY: IdbRecord[] = []
