export interface Serialized {
    text: string
    /** True when structured-clone types (Date, Map, Blob, …) were flattened to JSON. */
    lossy: boolean
}

/**
 * IndexedDB stores structured-clone values, which JSON can't fully express.
 * This renders them as readable JSON and reports when information was lost,
 * so the editor can warn before a save would change a value's type.
 */
export function serializeValue(value: unknown, indent = 0): Serialized {
    let lossy = false
    try {
        const text = JSON.stringify(
            value,
            function (this: Record<string, unknown>, key: string, replaced: unknown) {
                const raw = this[key]
                if (raw instanceof Date) {
                    lossy = true
                    return replaced // ISO string via Date#toJSON
                }
                if (raw instanceof Map) {
                    lossy = true
                    return { $Map: Array.from(raw.entries()) }
                }
                if (raw instanceof Set) {
                    lossy = true
                    return { $Set: Array.from(raw.values()) }
                }
                if (raw instanceof Blob) {
                    lossy = true
                    return { $Blob: `${raw.type || 'unknown type'}, ${raw.size} bytes` }
                }
                if (raw instanceof ArrayBuffer) {
                    lossy = true
                    return { $ArrayBuffer: `${raw.byteLength} bytes` }
                }
                if (ArrayBuffer.isView(raw)) {
                    lossy = true
                    return { [`$${raw.constructor.name}`]: `${raw.byteLength} bytes` }
                }
                if (typeof raw === 'bigint') {
                    lossy = true
                    return `${raw}n`
                }
                return replaced
            },
            indent,
        )
        return { text: text ?? 'undefined', lossy }
    } catch {
        return { text: '[unserializable value]', lossy: true }
    }
}

export function formatKey(key: IDBValidKey): string {
    if (typeof key === 'string') return key
    if (typeof key === 'number') return String(key)
    return serializeValue(key).text
}

/**
 * Keys typed into a form: JSON for numbers / arrays (`5`, `["a",1]`), anything
 * else is a plain string. Use quotes (`"5"`) to force a numeric-looking string.
 */
export function parseKey(input: string): IDBValidKey {
    const trimmed = input.trim()
    if (trimmed === '') throw new Error('Key is required.')
    try {
        const parsed: unknown = JSON.parse(trimmed)
        if (typeof parsed === 'string' || typeof parsed === 'number' || Array.isArray(parsed)) {
            return parsed as IDBValidKey
        }
    } catch {
        // not JSON → treat as a plain string key
    }
    return trimmed
}
