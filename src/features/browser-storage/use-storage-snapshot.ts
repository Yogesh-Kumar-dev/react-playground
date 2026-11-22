import { useSyncExternalStore } from 'react'

// Browser storage has no universal change event: `storage` only fires in
// *other* tabs, sessionStorage/cookies never fire, and IndexedDB has none.
// So panels subscribe to (a) our own mutations via notifyStorageChanged(),
// (b) the cross-tab `storage` event and (c) a light 1s poll that catches
// changes made by other scripts. getSnapshot returns a string, so React only
// re-renders when the serialised contents really changed.
const listeners = new Set<() => void>()

export function notifyStorageChanged() {
    listeners.forEach((listener) => listener())
}

function subscribe(onChange: () => void) {
    listeners.add(onChange)
    window.addEventListener('storage', onChange)
    const interval = window.setInterval(onChange, 1000)
    return () => {
        listeners.delete(onChange)
        window.removeEventListener('storage', onChange)
        window.clearInterval(interval)
    }
}

/** `getSnapshot` must be a stable (module-level) function returning a string. */
export function useStorageSnapshot(getSnapshot: () => string): string {
    return useSyncExternalStore(subscribe, getSnapshot, () => '')
}
