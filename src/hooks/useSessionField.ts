import { useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { createSessionStore } from "../state/sessionStore";

export function useSessionField<T, K extends keyof T>(store: ReturnType<typeof createSessionStore<T>>, key: K): [T[K], Dispatch<SetStateAction<T[K]>>] {
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return [value[key], next => store.setValue(current => ({
    ...current,
    [key]: typeof next === "function" ? (next as (previous: T[K]) => T[K])(current[key]) : next,
  }))];
}
