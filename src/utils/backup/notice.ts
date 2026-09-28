/** Dismissing acknowledgement must never reset navigation or restored data again. */
export function withoutBackupNotice<T extends { notice: string; noticeTitle: string }>(state: T): T {
  return { ...state, notice: "", noticeTitle: "" };
}
