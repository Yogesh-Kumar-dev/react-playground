/** The slice of the DOM Storage API this feature uses (window.localStorage satisfies it). */
export interface KeyValueStore {
    readonly length: number
    key(index: number): string | null
    getItem(key: string): string | null
    setItem(key: string, value: string): void
    removeItem(key: string): void
    clear(): void
}

/** An in-memory stand-in for localStorage/sessionStorage. */
export class MemoryStorage implements KeyValueStore {
    #map = new Map<string, string>()

    get length() {
        return this.#map.size
    }
    key(index: number) {
        return Array.from(this.#map.keys())[index] ?? null
    }
    getItem(key: string) {
        return this.#map.get(key) ?? null
    }
    setItem(key: string, value: string) {
        this.#map.set(String(key), String(value))
    }
    removeItem(key: string) {
        this.#map.delete(key)
    }
    clear() {
        this.#map.clear()
    }
}
