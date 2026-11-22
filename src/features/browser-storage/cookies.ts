import { notifyStorageChanged } from '@/features/browser-storage/use-storage-snapshot'

export interface CookieEntry {
    /** Decoded name, for display and editing. */
    name: string
    /** Name exactly as it appears in document.cookie (used for deletion). */
    rawName: string
    value: string
}

export type SameSite = 'Lax' | 'Strict' | 'None'

export interface CookieInput {
    name: string
    value: string
    path: string
    domain: string
    /** `datetime-local` string; '' = session cookie. */
    expires: string
    sameSite: SameSite
    secure: boolean
}

export const readCookieString = () => {
    try {
        return document.cookie
    } catch {
        return ''
    }
}

function safeDecode(text: string): string {
    try {
        return decodeURIComponent(text)
    } catch {
        return text
    }
}

export function parseCookies(raw: string): CookieEntry[] {
    if (!raw) return []
    return raw
        .split(/;\s*/)
        .filter(Boolean)
        .map((pair) => {
            const eq = pair.indexOf('=')
            const rawName = eq < 0 ? pair : pair.slice(0, eq)
            const rawValue = eq < 0 ? '' : pair.slice(eq + 1)
            return {
                name: safeDecode(rawName),
                rawName,
                value: safeDecode(rawValue),
            }
        })
}

export function defaultCookieInput(): CookieInput {
    return {
        name: '',
        value: '',
        path: '/',
        domain: '',
        expires: '',
        sameSite: 'Lax',
        secure: window.location.protocol === 'https:',
    }
}

/**
 * Create or overwrite a cookie. A cookie is identified by name + domain + path,
 * so the same name with a different path creates a second cookie.
 * Browsers silently ignore invalid cookies, so we read the jar back to verify.
 */
export function setCookie(input: CookieInput) {
    const name = input.name.trim()
    if (!name) throw new Error('Cookie name is required.')
    if (input.sameSite === 'None' && !input.secure) {
        throw new Error('SameSite=None requires the Secure flag.')
    }
    if (input.secure && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Secure cookies can only be set from https (or localhost).')
    }

    const parts = [
        `${encodeURIComponent(name)}=${encodeURIComponent(input.value)}`,
        `path=${input.path.trim() || '/'}`,
        `SameSite=${input.sameSite}`,
    ]
    if (input.domain.trim()) parts.push(`domain=${input.domain.trim()}`)
    if (input.expires) {
        const date = new Date(input.expires)
        if (Number.isNaN(date.getTime())) throw new Error('Invalid expiry date.')
        parts.push(`expires=${date.toUTCString()}`)
    }
    if (input.secure) parts.push('Secure')

    document.cookie = parts.join('; ')

    const expectedName = encodeURIComponent(name)
    const stored = parseCookies(readCookieString()).some(
        (cookie) => cookie.rawName === expectedName && cookie.value === input.value,
    )
    const expiredInPast = input.expires !== '' && new Date(input.expires).getTime() <= Date.now()
    if (!stored && !expiredInPast) {
        throw new Error(
            'The browser rejected this cookie. Check the domain, path, Secure and SameSite settings.',
        )
    }
    notifyStorageChanged()
}

function deletionScopes(): { paths: string[]; domains: (string | null)[] } {
    const { pathname, hostname } = window.location

    const paths = new Set<string>(['/'])
    let walked = ''
    for (const segment of pathname.split('/').filter(Boolean)) {
        walked += `/${segment}`
        paths.add(walked)
        paths.add(`${walked}/`)
    }

    const domains: (string | null)[] = [null]
    const isIp = /^[\d.]+$/.test(hostname) || hostname.includes(':')
    if (!isIp && hostname.includes('.')) {
        const labels = hostname.split('.')
        // Skip the bare TLD; browsers reject cookies on it anyway.
        for (let i = 0; i < labels.length - 1; i++) {
            const domain = labels.slice(i).join('.')
            domains.push(domain, `.${domain}`)
        }
    }
    return { paths: [...paths], domains }
}

/**
 * document.cookie can't reveal a cookie's path/domain, so we expire the name
 * under every path/domain combination that could have created it.
 * (HttpOnly cookies are invisible to JS and can't be touched at all.)
 */
export function deleteCookie(rawName: string) {
    const { paths, domains } = deletionScopes()
    for (const path of paths) {
        for (const domain of domains) {
            document.cookie = [
                `${rawName}=`,
                'expires=Thu, 01 Jan 1970 00:00:00 GMT',
                'max-age=0',
                `path=${path}`,
                domain ? `domain=${domain}` : '',
            ]
                .filter(Boolean)
                .join('; ')
        }
    }
    notifyStorageChanged()
}

export function deleteAllCookies() {
    for (const cookie of parseCookies(readCookieString())) deleteCookie(cookie.rawName)
}
