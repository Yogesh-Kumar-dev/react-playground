import type {
    CreateStoreInput,
    IdbBackend,
    IdbDatabaseInfo,
    IdbIndexInfo,
    IdbRecord,
    IdbRecordPage,
    IdbSchema,
    SaveRecordInput,
} from '@/features/browser-storage/indexed-db'
import { assignPath, compareKeys, extractKey, keyId, parseKeyPath } from '@/features/browser-storage/key-utils'

export interface MemoryStoreData {
    name: string
    keyPath: string | string[] | null
    autoIncrement: boolean
    indexes: IdbIndexInfo[]
    records: IdbRecord[]
}

export interface MemoryDatabaseData {
    name: string
    version: number
    stores: MemoryStoreData[]
}

interface Store {
    name: string
    keyPath: string | string[] | null
    autoIncrement: boolean
    indexes: IdbIndexInfo[]
    records: Map<string, IdbRecord>
    /** Last generated key, like IndexedDB's key generator. */
    generator: number
}

interface Database {
    name: string
    version: number
    stores: Map<string, Store>
}

const fail = (message: string, name: string) => new DOMException(message, name)

/**
 * An in-memory IndexedDB with the same operations as the real backend, so the
 * panel works identically on imported snapshot data without touching the
 * browser's storage. (Unique-index constraints are not enforced.)
 */
export class MemoryIdb implements IdbBackend {
    #databases = new Map<string, Database>()

    constructor(initial: MemoryDatabaseData[] = []) {
        for (const db of initial) {
            const stores = new Map<string, Store>()
            for (const source of db.stores) {
                const store: Store = {
                    name: source.name,
                    keyPath: source.keyPath,
                    autoIncrement: source.autoIncrement,
                    indexes: source.indexes,
                    records: new Map(),
                    generator: 0,
                }
                for (const record of source.records) {
                    store.records.set(keyId(record.key), record)
                    if (typeof record.key === 'number') store.generator = Math.max(store.generator, Math.floor(record.key))
                }
                stores.set(store.name, store)
            }
            this.#databases.set(db.name, { name: db.name, version: db.version, stores })
        }
    }

    /** Current contents, e.g. to download or write to real storage. */
    toData(): MemoryDatabaseData[] {
        return Array.from(this.#databases.values(), (db) => ({
            name: db.name,
            version: db.version,
            stores: Array.from(db.stores.values(), (store) => ({
                name: store.name,
                keyPath: store.keyPath,
                autoIncrement: store.autoIncrement,
                indexes: store.indexes,
                records: this.#sorted(store),
            })),
        }))
    }

    #db(name: string): Database {
        const db = this.#databases.get(name)
        if (!db) throw new Error(`Database "${name}" no longer exists.`)
        return db
    }

    #store(dbName: string, storeName: string): Store {
        const store = this.#db(dbName).stores.get(storeName)
        if (!store) throw fail(`Object store "${storeName}" was not found.`, 'NotFoundError')
        return store
    }

    #sorted(store: Store): IdbRecord[] {
        return Array.from(store.records.values()).sort((a, b) => compareKeys(a.key, b.key))
    }

    async listDatabases(): Promise<IdbDatabaseInfo[]> {
        return Array.from(this.#databases.values(), ({ name, version }) => ({ name, version })).sort((a, b) =>
            a.name.localeCompare(b.name),
        )
    }

    async createDatabase(name: string, firstStore?: string) {
        const trimmed = name.trim()
        if (!trimmed) throw new Error('Database name is required.')
        if (this.#databases.has(trimmed)) throw new Error(`Database "${trimmed}" already exists.`)
        const db: Database = { name: trimmed, version: 1, stores: new Map() }
        const storeName = firstStore?.trim()
        if (storeName) {
            db.stores.set(storeName, {
                name: storeName,
                keyPath: null,
                autoIncrement: false,
                indexes: [],
                records: new Map(),
                generator: 0,
            })
        }
        this.#databases.set(trimmed, db)
    }

    async deleteDatabase(name: string) {
        this.#databases.delete(name)
    }

    async getSchema(name: string): Promise<IdbSchema> {
        const db = this.#db(name)
        return {
            name: db.name,
            version: db.version,
            stores: Array.from(db.stores.values(), (store) => ({
                name: store.name,
                keyPath: store.keyPath,
                autoIncrement: store.autoIncrement,
                count: store.records.size,
                indexes: store.indexes,
            })),
        }
    }

    async createStore(dbName: string, input: CreateStoreInput) {
        const db = this.#db(dbName)
        const name = input.name.trim()
        if (!name) throw new Error('Store name is required.')
        if (db.stores.has(name)) throw new Error(`Store "${name}" already exists.`)
        db.stores.set(name, {
            name,
            keyPath: parseKeyPath(input.keyPath),
            autoIncrement: input.autoIncrement,
            indexes: [],
            records: new Map(),
            generator: 0,
        })
        db.version += 1
    }

    async deleteStore(dbName: string, storeName: string) {
        const db = this.#db(dbName)
        this.#store(dbName, storeName)
        db.stores.delete(storeName)
        db.version += 1
    }

    async readRecords(dbName: string, storeName: string, limit: number): Promise<IdbRecordPage> {
        const sorted = this.#sorted(this.#store(dbName, storeName))
        return { records: sorted.slice(0, limit), truncated: sorted.length > limit }
    }

    async saveRecord(dbName: string, storeName: string, input: SaveRecordInput) {
        const store = this.#store(dbName, storeName)
        const value = structuredClone(input.value)
        let key: IDBValidKey | undefined

        if (store.keyPath !== null) {
            key = extractKey(value, store.keyPath)
            if (key === undefined) {
                if (!store.autoIncrement || Array.isArray(store.keyPath)) {
                    throw fail('The key path did not yield a valid key for this value.', 'DataError')
                }
                key = ++store.generator
                if (!assignPath(value, store.keyPath, key)) {
                    throw fail('Cannot inject a generated key into this value.', 'DataError')
                }
            }
        } else if (input.key === undefined) {
            if (!store.autoIncrement) throw fail('A key is required for this object store.', 'DataError')
            key = ++store.generator
        } else {
            key = input.key
        }

        if (store.autoIncrement && typeof key === 'number') store.generator = Math.max(store.generator, Math.floor(key))

        const id = keyId(key)
        if (input.mode === 'add' && store.records.has(id)) {
            throw fail('Key already exists in the object store.', 'ConstraintError')
        }
        store.records.set(id, { key, value })
    }

    async deleteRecord(dbName: string, storeName: string, key: IDBValidKey) {
        this.#store(dbName, storeName).records.delete(keyId(key))
    }

    async deleteRecords(dbName: string, storeName: string, keys: IDBValidKey[]) {
        const store = this.#store(dbName, storeName)
        for (const key of keys) store.records.delete(keyId(key))
    }

    async clearStore(dbName: string, storeName: string) {
        this.#store(dbName, storeName).records.clear()
    }
}
