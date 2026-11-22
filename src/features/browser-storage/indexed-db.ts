import { parseKeyPath } from '@/features/browser-storage/key-utils'
import { getWorkspace } from '@/features/browser-storage/workspace'

export interface IdbDatabaseInfo {
    name: string
    version: number
}

export interface IdbIndexInfo {
    name: string
    keyPath: string | string[]
    unique: boolean
    multiEntry: boolean
}

export interface IdbStoreInfo {
    name: string
    keyPath: string | string[] | null
    autoIncrement: boolean
    count: number
    indexes: IdbIndexInfo[]
}

export interface IdbSchema {
    name: string
    version: number
    stores: IdbStoreInfo[]
}

export interface IdbRecord {
    key: IDBValidKey
    value: unknown
}

export interface IdbRecordPage {
    records: IdbRecord[]
    truncated: boolean
}

// ---------------------------------------------------------------- plumbing

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

function transactionDone(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted.'))
    })
}

function openDatabase(
    name: string,
    version?: number,
    onUpgrade?: (db: IDBDatabase, tx: IDBTransaction) => void,
): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = version === undefined ? indexedDB.open(name) : indexedDB.open(name, version)
        let settled = false
        let upgradeError: unknown

        request.onupgradeneeded = (event) => {
            // A versionless open of a missing database would silently create it.
            // Reads/deletes must never do that (e.g. a stale refetch after delete).
            if (!onUpgrade && event.oldVersion === 0) {
                upgradeError = new Error(`Database "${name}" no longer exists.`)
                request.transaction!.abort()
                return
            }
            try {
                onUpgrade?.(request.result, request.transaction!)
            } catch (error) {
                upgradeError = error
                request.transaction!.abort()
            }
        }
        request.onsuccess = () => {
            const db = request.result
            // Let other connections (e.g. another tab) upgrade/delete this DB.
            db.onversionchange = () => db.close()
            if (settled) db.close()
            else resolve(db)
            settled = true
        }
        request.onerror = () => {
            settled = true
            reject(upgradeError ?? request.error)
        }
        request.onblocked = () => {
            if (settled) return
            settled = true
            reject(
                new Error(
                    'Blocked by another open connection to this database. Close other tabs or code using it and try again.',
                ),
            )
        }
    })
}

/** Open → run → always close, so we never block upgrades/deletes. */
async function withDatabase<T>(name: string, run: (db: IDBDatabase) => Promise<T>): Promise<T> {
    const db = await openDatabase(name)
    try {
        return await run(db)
    } finally {
        db.close()
    }
}

/** Object stores can only change inside a version bump. */
async function upgradeDatabase(name: string, change: (db: IDBDatabase) => void) {
    const current = await withDatabase(name, async (db) => db.version)
    const db = await openDatabase(name, current + 1, (upgradeDb) => change(upgradeDb))
    db.close()
}

// ---------------------------------------------------------------- databases

export function isIndexedDbListingSupported(): boolean {
    return typeof indexedDB !== 'undefined' && typeof indexedDB.databases === 'function'
}

async function realListDatabases(): Promise<IdbDatabaseInfo[]> {
    if (!isIndexedDbListingSupported()) {
        throw new Error('This browser cannot list IndexedDB databases (indexedDB.databases() is unavailable).')
    }
    const databases = await indexedDB.databases()
    return databases
        .filter((db): db is { name: string; version: number } => !!db.name)
        .map((db) => ({ name: db.name, version: db.version ?? 1 }))
        .sort((a, b) => a.name.localeCompare(b.name))
}

async function realCreateDatabase(name: string, firstStore?: string) {
    const trimmed = name.trim()
    if (!trimmed) throw new Error('Database name is required.')
    if ((await realListDatabases()).some((db) => db.name === trimmed)) {
        throw new Error(`Database "${trimmed}" already exists.`)
    }
    const db = await openDatabase(trimmed, 1, (upgradeDb) => {
        if (firstStore?.trim()) upgradeDb.createObjectStore(firstStore.trim())
    })
    db.close()
}

function realDeleteDatabase(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(name)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
        request.onblocked = () =>
            reject(
                new Error(
                    'Deletion is blocked by an open connection. It will finish once other tabs/code close the database.',
                ),
            )
    })
}

// ---------------------------------------------------------------- schema

function realGetSchema(name: string): Promise<IdbSchema> {
    return withDatabase(name, async (db) => {
        const storeNames = Array.from(db.objectStoreNames)
        let stores: IdbStoreInfo[] = []
        if (storeNames.length > 0) {
            const tx = db.transaction(storeNames, 'readonly')
            stores = await Promise.all(
                storeNames.map(async (storeName) => {
                    const store = tx.objectStore(storeName)
                    return {
                        name: store.name,
                        keyPath: store.keyPath,
                        autoIncrement: store.autoIncrement,
                        count: await requestToPromise(store.count()),
                        indexes: Array.from(store.indexNames).map((indexName) => {
                            const index = store.index(indexName)
                            return {
                                name: index.name,
                                keyPath: index.keyPath,
                                unique: index.unique,
                                multiEntry: index.multiEntry,
                            }
                        }),
                    }
                }),
            )
        }
        return { name: db.name, version: db.version, stores }
    })
}

export interface CreateStoreInput {
    name: string
    /** '' = out-of-line keys; 'id' = in-line; 'a,b' = compound. */
    keyPath: string
    autoIncrement: boolean
}

async function realCreateStore(dbName: string, input: CreateStoreInput) {
    const name = input.name.trim()
    if (!name) throw new Error('Store name is required.')
    const schema = await realGetSchema(dbName)
    if (schema.stores.some((store) => store.name === name)) {
        throw new Error(`Store "${name}" already exists.`)
    }
    const keyPath = parseKeyPath(input.keyPath)
    await upgradeDatabase(dbName, (db) => {
        db.createObjectStore(name, {
            ...(keyPath === null ? {} : { keyPath }),
            autoIncrement: input.autoIncrement,
        })
    })
}

async function realDeleteStore(dbName: string, storeName: string) {
    await upgradeDatabase(dbName, (db) => db.deleteObjectStore(storeName))
}

// ---------------------------------------------------------------- records

function realReadRecords(dbName: string, storeName: string, limit: number): Promise<IdbRecordPage> {
    return withDatabase(
        dbName,
        (db) =>
            new Promise<IdbRecordPage>((resolve, reject) => {
                const records: IdbRecord[] = []
                const request = db.transaction(storeName, 'readonly').objectStore(storeName).openCursor()
                request.onerror = () => reject(request.error)
                request.onsuccess = () => {
                    const cursor = request.result
                    if (!cursor) return resolve({ records, truncated: false })
                    if (records.length >= limit) return resolve({ records, truncated: true })
                    records.push({ key: cursor.primaryKey, value: cursor.value })
                    cursor.continue()
                }
            }),
    )
}

export interface SaveRecordInput {
    /** add = fail if the key exists; put = create or overwrite. */
    mode: 'add' | 'put'
    /** Only for stores without an in-line keyPath. Omit for auto-increment. */
    key?: IDBValidKey
    value: unknown
}

function realSaveRecord(dbName: string, storeName: string, input: SaveRecordInput) {
    return withDatabase(dbName, async (db) => {
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        const key = store.keyPath === null ? input.key : undefined
        const request =
            input.mode === 'add'
                ? key === undefined
                    ? store.add(input.value)
                    : store.add(input.value, key)
                : key === undefined
                  ? store.put(input.value)
                  : store.put(input.value, key)
        await Promise.all([requestToPromise(request), transactionDone(tx)])
    })
}

function realDeleteRecord(dbName: string, storeName: string, key: IDBValidKey) {
    return withDatabase(dbName, async (db) => {
        const tx = db.transaction(storeName, 'readwrite')
        tx.objectStore(storeName).delete(key)
        await transactionDone(tx)
    })
}

/** One transaction: either every key is removed or none are. */
function realDeleteRecords(dbName: string, storeName: string, keys: IDBValidKey[]) {
    return withDatabase(dbName, async (db) => {
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)
        for (const key of keys) store.delete(key)
        await transactionDone(tx)
    })
}

function realClearStore(dbName: string, storeName: string) {
    return withDatabase(dbName, async (db) => {
        const tx = db.transaction(storeName, 'readwrite')
        tx.objectStore(storeName).clear()
        await transactionDone(tx)
    })
}

// ---------------------------------------------------------------- backends

export interface IdbBackend {
    listDatabases(): Promise<IdbDatabaseInfo[]>
    createDatabase(name: string, firstStore?: string): Promise<void>
    deleteDatabase(name: string): Promise<void>
    getSchema(name: string): Promise<IdbSchema>
    createStore(dbName: string, input: CreateStoreInput): Promise<void>
    deleteStore(dbName: string, storeName: string): Promise<void>
    readRecords(dbName: string, storeName: string, limit: number): Promise<IdbRecordPage>
    saveRecord(dbName: string, storeName: string, input: SaveRecordInput): Promise<void>
    deleteRecord(dbName: string, storeName: string, key: IDBValidKey): Promise<void>
    deleteRecords(dbName: string, storeName: string, keys: IDBValidKey[]): Promise<void>
    clearStore(dbName: string, storeName: string): Promise<void>
}

/** The browser's real IndexedDB. */
export const realBackend: IdbBackend = {
    listDatabases: realListDatabases,
    createDatabase: realCreateDatabase,
    deleteDatabase: realDeleteDatabase,
    getSchema: realGetSchema,
    createStore: realCreateStore,
    deleteStore: realDeleteStore,
    readRecords: realReadRecords,
    saveRecord: realSaveRecord,
    deleteRecord: realDeleteRecord,
    deleteRecords: realDeleteRecords,
    clearStore: realClearStore,
}

// While an imported snapshot is open, every call goes to its in-memory copy.
const backend = (): IdbBackend => getWorkspace()?.idb ?? realBackend

export const listDatabases = () => backend().listDatabases()
export const createDatabase = (name: string, firstStore?: string) => backend().createDatabase(name, firstStore)
export const deleteDatabase = (name: string) => backend().deleteDatabase(name)
export const getSchema = (name: string) => backend().getSchema(name)
export const createStore = (dbName: string, input: CreateStoreInput) => backend().createStore(dbName, input)
export const deleteStore = (dbName: string, storeName: string) => backend().deleteStore(dbName, storeName)
export const readRecords = (dbName: string, storeName: string, limit: number) =>
    backend().readRecords(dbName, storeName, limit)
export const saveRecord = (dbName: string, storeName: string, input: SaveRecordInput) =>
    backend().saveRecord(dbName, storeName, input)
export const deleteRecord = (dbName: string, storeName: string, key: IDBValidKey) =>
    backend().deleteRecord(dbName, storeName, key)
export const deleteRecords = (dbName: string, storeName: string, keys: IDBValidKey[]) =>
    backend().deleteRecords(dbName, storeName, keys)
export const clearStore = (dbName: string, storeName: string) => backend().clearStore(dbName, storeName)

// ---------------------------------------------------------------- import

export interface ImportableDatabase {
    name: string
    version: number
    stores: {
        name: string
        keyPath: string | string[] | null
        autoIncrement: boolean
        indexes: IdbIndexInfo[]
        records: IdbRecord[]
    }[]
}

/** Creates a real database with its stores, indexes and records in one go. */
export async function importDatabaseToReal(database: ImportableDatabase): Promise<void> {
    const db = await openDatabase(database.name, database.version, (upgradeDb) => {
        for (const source of database.stores) {
            const store = upgradeDb.createObjectStore(source.name, {
                ...(source.keyPath === null ? {} : { keyPath: source.keyPath }),
                autoIncrement: source.autoIncrement,
            })
            for (const index of source.indexes) {
                store.createIndex(index.name, index.keyPath, { unique: index.unique, multiEntry: index.multiEntry })
            }
        }
    })
    try {
        for (const source of database.stores) {
            if (source.records.length === 0) continue
            const tx = db.transaction(source.name, 'readwrite')
            const store = tx.objectStore(source.name)
            for (const record of source.records) {
                if (source.keyPath === null) store.put(record.value, record.key)
                else store.put(record.value)
            }
            await transactionDone(tx)
        }
    } finally {
        db.close()
    }
}
