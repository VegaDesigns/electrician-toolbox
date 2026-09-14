import { useEffect, useSyncExternalStore } from "react";
import { createPersistentStore } from "../utils/storage/persistentStore";

export function useStoredValue<T>(store: ReturnType<typeof createPersistentStore<T>>) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => { void store.load(); }, [store]);
  return { ...snapshot, setValue: store.setValue, retry: store.retry };
}
