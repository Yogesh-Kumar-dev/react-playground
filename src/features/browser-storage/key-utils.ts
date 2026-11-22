// IndexedDB key helpers shared by the in-memory backend (and the real one).

export function parseKeyPath(input: string): string | string[] | null {
    const trimmed = input.trim()
    if (!trimmed) return null
    if (!trimmed.includes(',')) return trimmed
    return trimmed.split(',').map((part) => part.trim()).filter(Boolean)
}

function isBinary(value: unknown): value is ArrayBuffer | ArrayBufferView {
    return value instanceof ArrayBuffer || ArrayBuffer.isView(value)
}

function bytesOf(value: ArrayBuffer | ArrayBufferView): Uint8Array {
    return value instanceof ArrayBuffer
        ? new Uint8Array(value)
        : new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
}

export function isValidKey(value: unknown): value is IDBValidKey {
    if (typeof value === 'number') return !Number.isNaN(value)
    if (typeof value === 'string' || isBinary(value)) return true
    if (value instanceof Date) return !Number.isNaN(value.getTime())
    return Array.isArray(value) && value.every(isValidKey)
}

/** Stable identity string for a key (equal keys ⇒ equal ids). */
export function keyId(key: IDBValidKey): string {
    if (typeof key === 'number') return `n:${key}`
    if (typeof key === 'string') return `s:${key}`
    if (key instanceof Date) return `d:${key.getTime()}`
    if (Array.isArray(key)) return `a:${JSON.stringify(key.map((part) => keyId(part)))}`
    return `b:${Array.from(bytesOf(key as ArrayBuffer | ArrayBufferView)).join(',')}`
}

const rank = (key: IDBValidKey) =>
    typeof key === 'number' ? 1 : key instanceof Date ? 2 : typeof key === 'string' ? 3 : Array.isArray(key) ? 5 : 4

/** The IndexedDB key ordering: number < Date < string < binary < array. */
export function compareKeys(a: IDBValidKey, b: IDBValidKey): number {
    const rankDiff = rank(a) - rank(b)
    if (rankDiff !== 0) return rankDiff
    if (typeof a === 'number') return a - (b as number)
    if (a instanceof Date) return a.getTime() - (b as Date).getTime()
    if (typeof a === 'string') return a < (b as string) ? -1 : a > (b as string) ? 1 : 0
    if (Array.isArray(a)) {
        const other = b as IDBValidKey[]
        for (let i = 0; i < Math.min(a.length, other.length); i++) {
            const diff = compareKeys(a[i], other[i])
            if (diff !== 0) return diff
        }
        return a.length - other.length
    }
    const left = bytesOf(a as ArrayBuffer | ArrayBufferView)
    const right = bytesOf(b as ArrayBuffer | ArrayBufferView)
    for (let i = 0; i < Math.min(left.length, right.length); i++) {
        if (left[i] !== right[i]) return left[i] - right[i]
    }
    return left.length - right.length
}

function readPath(value: unknown, path: string): unknown {
    if (path === '') return value
    let current: unknown = value
    for (const part of path.split('.')) {
        if (current === null || typeof current !== 'object' || !(part in current)) return undefined
        current = (current as Record<string, unknown>)[part]
    }
    return current
}

/** Evaluates a store's keyPath against a value; undefined when it yields no valid key. */
export function extractKey(value: unknown, keyPath: string | string[]): IDBValidKey | undefined {
    const result = Array.isArray(keyPath) ? keyPath.map((path) => readPath(value, path)) : readPath(value, keyPath)
    return isValidKey(result) ? result : undefined
}

/** Writes a generated key into a value at a (dotted) key path. */
export function assignPath(value: unknown, path: string, key: IDBValidKey): boolean {
    if (value === null || typeof value !== 'object') return false
    const parts = path.split('.')
    let current = value as Record<string, unknown>
    for (const part of parts.slice(0, -1)) {
        const next = current[part]
        if (next === undefined) current[part] = {}
        if (current[part] === null || typeof current[part] !== 'object') return false
        current = current[part] as Record<string, unknown>
    }
    current[parts[parts.length - 1]] = key
    return true
}
