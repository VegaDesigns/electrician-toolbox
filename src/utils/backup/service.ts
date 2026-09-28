import appStorage from "../storage/appStorage";
import { resetStorageParticipants, withSettledStorage } from "../storage/maintenance";
import { makeBackup, type ToolboxBackup } from "./schema";
import { readRecords, recoverInterruptedRestore, RecoveryRequiredError, restoreBackup } from "./transaction";
import { withoutBackupNotice } from "./notice";

type BackupState = { status: "loading" | "ready" | "blocked"; epoch: number; notice: string; noticeTitle: string; error: string };
let state: BackupState = { status: "loading", epoch: 0, notice: "", noticeTitle: "", error: "" };
const listeners = new Set<() => void>();
let startup: Promise<void> | null = null;
export const getBackupState = () => state;
export function subscribeBackup(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function publish(next: Partial<BackupState>) { state = { ...state, ...next }; listeners.forEach(listener => listener()); }
export function dismissBackupNotice() { publish(withoutBackupNotice(state)); }
export function initializeBackupRecovery() {
  if (startup) return startup;
  const retryingRecovery = state.status === "blocked";
  publish({ status: "loading", error: "" });
  appStorage.quarantine(true);
  startup = appStorage.exclusively(recoverInterruptedRestore).then(recovered => {
    resetStorageParticipants();
    appStorage.quarantine(false);
    publish({ status: "ready", epoch: state.epoch + 1,
      noticeTitle: recovered ? "Previous work recovered" : retryingRecovery ? "Saved data ready" : state.noticeTitle,
      notice: recovered ? "An interrupted restore was canceled. Your previous saved data was recovered." : retryingRecovery ? "Saved data is ready again. Check your lists and settings before continuing." : state.notice });
  }).catch(() => {
    publish({ status: "blocked", error: "Saved data could not be checked or recovered. Keep the app installed and retry. Your saved work has not been reset." });
  }).finally(() => { startup = null; });
  return startup;
}
export async function captureUserBackup(appVersion: string): Promise<ToolboxBackup> {
  if (state.status !== "ready") throw new Error("Finish recovering saved data first.");
  return withSettledStorage(() => appStorage.exclusively(async storage => makeBackup(await readRecords(storage), appVersion)));
}
export async function replaceFromUserBackup(backup: ToolboxBackup) {
  if (state.status !== "ready") throw new Error("Finish recovering saved data first.");
  try {
    await withSettledStorage(async () => {
      await appStorage.exclusively(storage => restoreBackup(storage, backup));
      resetStorageParticipants();
      publish({ epoch: state.epoch + 1, noticeTitle: "Backup restored", notice: "Your saved work and settings are ready. Unfinished entry drafts were cleared." });
    });
  } catch (error) {
    if (error instanceof RecoveryRequiredError) {
      appStorage.quarantine(true);
      publish({ status: "blocked", error: error.message });
    }
    throw error;
  }
}
