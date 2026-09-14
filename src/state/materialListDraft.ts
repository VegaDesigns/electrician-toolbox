import { createSessionStore } from "./sessionStore";

/** Browser history can bypass native leave guards; retain the unfinished form. */
export const materialListDraft = createSessionStore<{
  selectedId: string | null; entry: string; adding: "material" | "note" | null;
  editing: string | null; editText: string; quantity: string;
  nameDraft: string; manage: "options" | "rename" | "delete" | null;
}>(() => ({ selectedId: null, entry: "", adding: null, editing: null, editText: "", quantity: "0", nameDraft: "", manage: null }));
