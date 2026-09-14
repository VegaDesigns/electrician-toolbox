/** Drafts last for this app session, including when a route is unmounted. */
export function createSessionStore<T>(defaults: () => T) {
  let value = defaults();
  const listeners = new Set<() => void>();
  function setValue(next: T | ((current: T) => T)) {
    value = typeof next === "function" ? (next as (current: T) => T)(value) : next;
    listeners.forEach(listener => listener());
  }
  return {
    getSnapshot: () => value,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    setValue,
    reset: () => setValue(defaults()),
  };
}
