export type StorageSnapshot<T> = {
  value: T; ready: boolean; loading: boolean; saving: boolean; dirty: boolean;
  error: "load" | "save" | null;
};

/** Reads never write. A failed read must succeed before edits can be saved. */
export function createPersistentStore<T>(loadValue: () => Promise<T>, saveValue: (value: T) => Promise<void>, initial: T) {
  let snapshot: StorageSnapshot<T> = { value: initial, ready: false, loading: false, saving: false, dirty: false, error: null };
  const listeners = new Set<() => void>();
  let loading: Promise<void> | null = null;
  let queue = Promise.resolve();
  let revision = 0;
  function publish(next: Partial<StorageSnapshot<T>>) {
    snapshot = { ...snapshot, ...next };
    listeners.forEach(listener => listener());
  }
  function load() {
    if (snapshot.ready) return Promise.resolve();
    if (loading) return loading;
    publish({ loading: true, error: null });
    loading = Promise.resolve().then(loadValue)
      .then(value => publish({ value, ready: true, dirty: false }))
      .catch(() => publish({ error: "load" }))
      .finally(() => { loading = null; publish({ loading: false }); });
    return loading;
  }
  function setValue(update: T | ((current: T) => T)) {
    if (!snapshot.ready) return Promise.resolve(false);
    const value = typeof update === "function" ? (update as (current: T) => T)(snapshot.value) : update;
    const request = ++revision;
    publish({ value, dirty: true, saving: true, error: null });
    const operation = queue.then(async () => {
      try {
        await saveValue(value);
        if (request === revision) publish({ dirty: false, error: null });
        return true;
      } catch {
        if (request === revision) publish({ error: "save" });
        return false;
      } finally {
        if (request === revision) publish({ saving: false });
      }
    });
    queue = operation.then(() => {});
    return operation;
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    load, setValue,
    retry: () => snapshot.ready ? setValue(snapshot.value) : load(),
  };
}
