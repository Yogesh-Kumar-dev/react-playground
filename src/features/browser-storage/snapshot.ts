import { z } from 'zod'
import type { IdbIndexInfo, IdbRecord } from '@/features/browser-storage/indexed-db'
import type { WebStorageEntry } from '@/features/browser-storage/web-storage'

export const SNAPSHOT_FORMAT = 'react-playground/browser-storage-snapshot'
export const MAX_SNAPSHOT_BYTES = 150 * 1024 * 1024

export interface DecodedStore {
    name: string
    keyPath: string | string[] | null
    autoIncrement: boolean
    indexes: IdbIndexInfo[]
    records: IdbRecord[]
}

export interface DecodedDatabase {
    name: string
    version: number
    stores: DecodedStore[]
}

/** A snapshot with IndexedDB values decoded back into real JS values. */
export interface DecodedSnapshot {
    source: string
    exportedAt: string
    /** A section is undefined when the export script didn't include it. */
    localStorage?: WebStorageEntry[]
    sessionStorage?: WebStorageEntry[]
    indexedDB?: DecodedDatabase[]
    errors: string[]
}

// ------------------------------------------------------------ file envelope

const keyPath = z.union([z.string(), z.array(z.string())])
const entry = z.object({ key: z.string(), value: z.string() })

const snapshotSchema = z.object({
    format: z.literal(SNAPSHOT_FORMAT),
    version: z.literal(1),
    source: z.string(),
    exportedAt: z.string(),
    localStorage: z.array(entry).optional(),
    sessionStorage: z.array(entry).optional(),
    indexedDB: z
        .array(
            z.object({
                name: z.string(),
                version: z.number().int().min(1),
                stores: z.array(
                    z.object({
                        name: z.string(),
                        keyPath: keyPath.nullable(),
                        autoIncrement: z.boolean(),
                        indexes: z.array(
                            z.object({ name: z.string(), keyPath, unique: z.boolean(), multiEntry: z.boolean() }),
                        ),
                        records: z.array(z.object({ key: z.unknown(), value: z.unknown() })),
                    }),
                ),
            }),
        )
        .optional(),
    errors: z.array(z.string()).optional(),
})

// ------------------------------------------------------------ tagged values
// JSON can't express Dates, Maps, Blobs, binary data, undefined, … so the
// export script tags them as { "$t": "<type>", … } and we revive them here.

function fromBase64(base64: string): Uint8Array<ArrayBuffer> {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

function toBase64(bytes: Uint8Array): string {
    let binary = ''
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    }
    return btoa(binary)
}

type ViewConstructor = new (buffer: ArrayBuffer) => ArrayBufferView

const VIEWS: Record<string, ViewConstructor> = {
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array,
    BigInt64Array,
    BigUint64Array,
    DataView,
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

/** Own data property, so keys like "__proto__" stay plain data. */
function setOwn(target: object, key: string, value: unknown) {
    Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true })
}

export function decodeValue(input: unknown): unknown {
    if (Array.isArray(input)) return input.map(decodeValue)
    if (!isRecord(input)) return input

    const tag = input.$t
    if (typeof tag === 'string') {
        switch (tag) {
            case 'undefined':
                return undefined
            case 'number':
                return Number(input.v)
            case 'bigint':
                return BigInt(String(input.v))
            case 'Date':
                return new Date(input.v === null ? NaN : String(input.v))
            case 'RegExp':
                return new RegExp(String(input.source), String(input.flags ?? ''))
            case 'ArrayBuffer':
                return fromBase64(String(input.b64)).buffer
            case 'TypedArray': {
                const View = VIEWS[String(input.name)]
                return View ? new View(fromBase64(String(input.b64)).buffer) : fromBase64(String(input.b64))
            }
            case 'Blob':
            case 'File': {
                const bytes = fromBase64(String(input.b64))
                const type = typeof input.type === 'string' ? input.type : ''
                return tag === 'File'
                    ? new File([bytes], typeof input.name === 'string' ? input.name : 'file', {
                          type,
                          lastModified: typeof input.lastModified === 'number' ? input.lastModified : Date.now(),
                      })
                    : new Blob([bytes], { type })
            }
            case 'Map':
                return new Map(
                    (input.v as unknown[][]).map(([key, value]) => [decodeValue(key), decodeValue(value)] as const),
                )
            case 'Set':
                return new Set((input.v as unknown[]).map(decodeValue))
            case 'Circular':
                return null
            case 'Object':
                return decodeValue(input.v)
        }
    }

    const out = {}
    for (const [key, value] of Object.entries(input)) setOwn(out, key, decodeValue(value))
    return out
}

export async function encodeValue(value: unknown, stack: object[] = []): Promise<unknown> {
    if (value === undefined) return { $t: 'undefined' }
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
    if (typeof value === 'number') return Number.isFinite(value) ? value : { $t: 'number', v: String(value) }
    if (typeof value === 'bigint') return { $t: 'bigint', v: value.toString() }
    if (typeof value !== 'object') return null
    if (stack.includes(value)) return { $t: 'Circular' }
    const next = [...stack, value]

    if (value instanceof Date) return { $t: 'Date', v: Number.isNaN(value.getTime()) ? null : value.toISOString() }
    if (value instanceof RegExp) return { $t: 'RegExp', source: value.source, flags: value.flags }
    if (value instanceof ArrayBuffer) return { $t: 'ArrayBuffer', b64: toBase64(new Uint8Array(value)) }
    if (ArrayBuffer.isView(value)) {
        const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
        return { $t: 'TypedArray', name: value.constructor.name, b64: toBase64(bytes) }
    }
    if (value instanceof Blob) {
        return {
            $t: value instanceof File ? 'File' : 'Blob',
            type: value.type,
            ...(value instanceof File ? { name: value.name, lastModified: value.lastModified } : {}),
            b64: toBase64(new Uint8Array(await value.arrayBuffer())),
        }
    }
    if (value instanceof Map) {
        return {
            $t: 'Map',
            v: await Promise.all(
                Array.from(value, async ([k, v]) => [await encodeValue(k, next), await encodeValue(v, next)]),
            ),
        }
    }
    if (value instanceof Set) {
        return { $t: 'Set', v: await Promise.all(Array.from(value, (item) => encodeValue(item, next))) }
    }
    if (Array.isArray(value)) return Promise.all(value.map((item) => encodeValue(item, next)))

    const out = {}
    for (const [key, item] of Object.entries(value)) setOwn(out, key, await encodeValue(item, next))
    return Object.prototype.hasOwnProperty.call(out, '$t') ? { $t: 'Object', v: out } : out
}

// ------------------------------------------------------------ parse / export

/** Parses and validates the text of a snapshot file. Throws a readable Error. */
export function parseSnapshot(text: string): DecodedSnapshot {
    let json: unknown
    try {
        json = JSON.parse(text)
    } catch {
        throw new Error('This file is not valid JSON.')
    }

    const result = snapshotSchema.safeParse(json)
    if (!result.success) {
        const issue = result.error.issues[0]
        const where = issue.path.length ? ` (at ${issue.path.join('.')})` : ''
        throw new Error(
            `This doesn't look like a snapshot made by the export script${where}: ${issue.message}`,
        )
    }

    const data = result.data
    return {
        source: data.source,
        exportedAt: data.exportedAt,
        localStorage: data.localStorage,
        sessionStorage: data.sessionStorage,
        errors: data.errors ?? [],
        indexedDB: data.indexedDB?.map((db) => ({
            ...db,
            stores: db.stores.map((store) => ({
                ...store,
                records: store.records.map((record) => ({
                    key: decodeValue(record.key) as IDBValidKey,
                    value: decodeValue(record.value),
                })),
            })),
        })),
    }
}

/** Serialises a (possibly edited) snapshot back into the same file format. */
export async function encodeSnapshot(snapshot: DecodedSnapshot): Promise<string> {
    const indexedDB = snapshot.indexedDB
        ? await Promise.all(
              snapshot.indexedDB.map(async (db) => ({
                  ...db,
                  stores: await Promise.all(
                      db.stores.map(async (store) => ({
                          ...store,
                          records: await Promise.all(
                              store.records.map(async (record) => ({
                                  key: await encodeValue(record.key),
                                  value: await encodeValue(record.value),
                              })),
                          ),
                      })),
                  ),
              })),
          )
        : undefined

    return JSON.stringify({
        format: SNAPSHOT_FORMAT,
        version: 1,
        source: snapshot.source,
        exportedAt: new Date().toISOString(),
        localStorage: snapshot.localStorage,
        sessionStorage: snapshot.sessionStorage,
        indexedDB,
    })
}

export function downloadText(filename: string, text: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
