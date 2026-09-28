export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  removeItem(key: string): Promise<unknown>;
}

/** Serialize actual I/O; an exclusive restore cannot interleave with an ordinary save. */
export function createStorageAccess(raw: KeyValueStorage) {
  let queue: Promise<unknown> = Promise.resolve();
  let exclusive = false;
  let quarantined = false;
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (exclusive || quarantined) return Promise.reject(new Error("Saved data is being recovered. Please try again after recovery."));
    const result = queue.catch(() => {}).then(operation);
    queue = result;
    return result;
  }
  return {
    getItem: (key: string) => enqueue(() => raw.getItem(key)),
    setItem: (key: string, value: string) => enqueue(() => raw.setItem(key, value)),
    removeItem: (key: string) => enqueue(() => raw.removeItem(key)),
    quarantine(value: boolean) { quarantined = value; },
    async exclusively<T>(operation: (storage: KeyValueStorage) => Promise<T>): Promise<T> {
      if (exclusive) throw new Error("Another backup operation is already running.");
      exclusive = true;
      try { await queue.catch(() => {}); return await operation(raw); }
      finally { exclusive = false; }
    },
  };
}
