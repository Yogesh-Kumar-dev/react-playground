import { SNAPSHOT_FORMAT } from '@/features/browser-storage/snapshot'

export type ExportTarget = 'local' | 'session' | 'idb'

export const EXPORT_TARGETS: { id: ExportTarget; label: string }[] = [
    { id: 'local', label: 'Local Storage' },
    { id: 'session', label: 'Session Storage' },
    { id: 'idb', label: 'IndexedDB' },
]

// The scripts run in the DevTools console of the site being exported, so they
// are plain self-contained JavaScript (no imports, no backticks/template
// strings). Each combination below is assembled once, at module load, from
// these pieces — the user always gets one complete, predefined script.

const HEAD = `(async () => {
  'use strict';
  const errors = [];
  const snapshot = {
    format: '${SNAPSHOT_FORMAT}',
    version: 1,
    source: location.origin,
    exportedAt: new Date().toISOString(),
  };
`

const webStorage = (target: 'local' | 'session') => {
  const name = target === 'local' ? 'localStorage' : 'sessionStorage'
  return `
  // ${name}
  try {
    snapshot.${name} = [];
    for (let i = 0; i < ${name}.length; i++) {
      const key = ${name}.key(i);
      snapshot.${name}.push({ key: key, value: ${name}.getItem(key) });
    }
  } catch (e) {
    errors.push('${name}: ' + e);
  }
`
}

const IDB = `
  // IndexedDB (dates, Maps, Blobs and binary data are tagged so they survive JSON)
  const toB64 = (bytes) => {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const encode = async (value, stack = []) => {
    if (value === undefined) return { $t: 'undefined' };
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? value : { $t: 'number', v: String(value) };
    if (typeof value === 'bigint') return { $t: 'bigint', v: value.toString() };
    if (typeof value !== 'object') return null;
    if (stack.includes(value)) return { $t: 'Circular' };
    const next = stack.concat([value]);
    if (value instanceof Date) return { $t: 'Date', v: isNaN(value) ? null : value.toISOString() };
    if (value instanceof RegExp) return { $t: 'RegExp', source: value.source, flags: value.flags };
    if (value instanceof ArrayBuffer) return { $t: 'ArrayBuffer', b64: toB64(new Uint8Array(value)) };
    if (ArrayBuffer.isView(value)) {
      return { $t: 'TypedArray', name: value.constructor.name, b64: toB64(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)) };
    }
    if (value instanceof Blob) {
      const isFile = typeof File !== 'undefined' && value instanceof File;
      const out = { $t: isFile ? 'File' : 'Blob', type: value.type, b64: toB64(new Uint8Array(await value.arrayBuffer())) };
      if (isFile) { out.name = value.name; out.lastModified = value.lastModified; }
      return out;
    }
    if (value instanceof Map) {
      return { $t: 'Map', v: await Promise.all(Array.from(value, async (pair) => [await encode(pair[0], next), await encode(pair[1], next)])) };
    }
    if (value instanceof Set) return { $t: 'Set', v: await Promise.all(Array.from(value, (x) => encode(x, next))) };
    if (Array.isArray(value)) return Promise.all(value.map((x) => encode(x, next)));
    const out = {};
    for (const k of Object.keys(value)) {
      Object.defineProperty(out, k, { value: await encode(value[k], next), enumerable: true, writable: true, configurable: true });
    }
    return Object.prototype.hasOwnProperty.call(out, '$t') ? { $t: 'Object', v: out } : out;
  };
  const openDb = (name) => new Promise((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onupgradeneeded = () => request.transaction.abort(); // never create a database
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('blocked'));
  });
  const readAll = (store) => new Promise((resolve, reject) => {
    const rows = [];
    const cursor = store.openCursor();
    cursor.onerror = () => reject(cursor.error);
    cursor.onsuccess = () => {
      const c = cursor.result;
      if (!c) return resolve(rows);
      rows.push({ key: c.primaryKey, value: c.value });
      c.continue();
    };
  });
  snapshot.indexedDB = [];
  if (!indexedDB.databases) {
    errors.push('indexedDB.databases() is not supported in this browser, so IndexedDB was skipped.');
  } else {
    for (const info of await indexedDB.databases()) {
      if (!info.name) continue;
      try {
        const db = await openDb(info.name);
        try {
          const stores = [];
          for (const storeName of Array.from(db.objectStoreNames)) {
            const store = db.transaction(storeName, 'readonly').objectStore(storeName);
            const rows = await readAll(store);
            stores.push({
              name: store.name,
              keyPath: store.keyPath,
              autoIncrement: store.autoIncrement,
              indexes: Array.from(store.indexNames).map((n) => {
                const i = store.index(n);
                return { name: i.name, keyPath: i.keyPath, unique: i.unique, multiEntry: i.multiEntry };
              }),
              records: await Promise.all(rows.map(async (r) => ({ key: await encode(r.key), value: await encode(r.value) }))),
            });
          }
          snapshot.indexedDB.push({ name: db.name, version: db.version, stores: stores });
        } finally {
          db.close();
        }
      } catch (e) {
        errors.push('IndexedDB "' + info.name + '": ' + e);
      }
    }
  }
`

const TAIL = `
  if (errors.length) snapshot.errors = errors;
  const text = JSON.stringify(snapshot);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  link.download = 'storage-' + (location.hostname || 'local').replace(/[^a-z0-9.-]/gi, '_') + '-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 10000);
  console.log('Snapshot downloaded (' + Math.round(text.length / 1024) + ' KB). Import it in the Browser Storage page.', snapshot);
  if (errors.length) console.warn('Some parts could not be exported:', errors);
})();
`

const PART: Record<ExportTarget, string> = {
    local: webStorage('local'),
    session: webStorage('session'),
    idb: IDB,
}

const ORDER: ExportTarget[] = ['local', 'session', 'idb']
const LABEL: Record<ExportTarget, string> = {
    local: 'localStorage',
    session: 'sessionStorage',
    idb: 'IndexedDB',
}

const keyOf = (targets: ExportTarget[]) => ORDER.filter((target) => targets.includes(target)).join('+')

function build(targets: ExportTarget[]): string {
    const comment = `// Browser Storage export — reads ${targets.map((t) => LABEL[t]).join(' + ')} of the current site\n// and downloads it as a JSON file. Run it in the DevTools Console of the site to copy from.\n`
    return comment + HEAD + targets.map((target) => PART[target]).join('') + TAIL
}

/** All seven combinations of the three targets, assembled once up front. */
const SCRIPTS: Record<string, string> = {}
for (let mask = 1; mask < 8; mask++) {
    const targets = ORDER.filter((_, index) => mask & (1 << index))
    SCRIPTS[keyOf(targets)] = build(targets)
}

/** The predefined script for a combination, or null when nothing is selected. */
export function scriptFor(targets: ExportTarget[]): string | null {
    return SCRIPTS[keyOf(targets)] ?? null
}
