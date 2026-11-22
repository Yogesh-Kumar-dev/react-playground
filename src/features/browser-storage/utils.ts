export function errorMessage(error: unknown): string {
    if (error instanceof DOMException) return `${error.name}: ${error.message}`
    if (error instanceof Error) return error.message
    return String(error)
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function truncate(text: string, max: number): string {
    return text.length > max ? `${text.slice(0, max)}…` : text
}

/** Pretty-prints `text` if it is valid JSON, otherwise returns null. */
export function tryFormatJson(text: string): string | null {
    try {
        return JSON.stringify(JSON.parse(text), null, 2)
    } catch {
        return null
    }
}

/** TanStack Form errors are strings or Standard Schema issues ({ message }). */
export function errorTexts(errors: unknown[]): string[] {
    return errors
        .map((error) => {
            if (typeof error === 'string') return error
            if (error && typeof error === 'object' && 'message' in error) return String(error.message)
            return ''
        })
        .filter(Boolean)
}

export function isValidJson(text: string): boolean {
    try {
        JSON.parse(text)
        return true
    } catch {
        return false
    }
}
