import type { KeyValueStorage } from "../storage/access";
import { DATA_KEYS, MAX_BACKUP_BYTES, parseBackup, validateRecordEnvelope, type BackupRecords, type ToolboxBackup } from "./schema";

export const RESTORE_JOURNAL_KEY = "electrician-toolbox:restore-journal:v1";
export class RecoveryRequiredError extends Error {}
export async function readRecords(storage: KeyValueStorage): Promise<BackupRecords> {
  const values = await Promise.all(DATA_KEYS.map(async key => [key, await storage.getItem(key)] as const));
  return Object.fromEntries(values) as BackupRecords;
}
async function applyRecords(storage: KeyValueStorage, records: BackupRecords) {
  for (const key of DATA_KEYS) {
    const value = records[key];
    if (value === null) await storage.removeItem(key); else await storage.setItem(key, value);
  }
  const saved = await readRecords(storage);
  if (DATA_KEYS.some(key => saved[key] !== records[key])) throw new Error("Saved data could not be verified.");
}
async function clearJournal(storage: KeyValueStorage) {
  await storage.removeItem(RESTORE_JOURNAL_KEY);
  if (await storage.getItem(RESTORE_JOURNAL_KEY) !== null) throw new Error("Recovery information could not be cleared.");
}
function readJournal(raw: string): BackupRecords {
  if (raw.length > MAX_BACKUP_BYTES * 2) throw new Error("Recovery information is too large.");
  const journal: unknown = JSON.parse(raw);
  if (!journal || typeof journal !== "object" || !("version" in journal) || journal.version !== 1 || !("original" in journal)) throw new Error("Recovery information is unreadable.");
  validateRecordEnvelope(journal.original);
  // Keep exact originals, including an already-unreadable record, rather than silently resetting it.
  return journal.original;
}
export async function recoverInterruptedRestore(storage: KeyValueStorage) {
  const raw = await storage.getItem(RESTORE_JOURNAL_KEY);
  if (raw === null) return false;
  try { await applyRecords(storage, readJournal(raw)); await clearJournal(storage); return true; }
  catch { throw new RecoveryRequiredError("Your previous data still needs recovery. Keep the app installed and retry; do not start another restore."); }
}
/** Caller holds the app-wide storage gate throughout this transaction. */
export async function restoreBackup(storage: KeyValueStorage, candidate: ToolboxBackup): Promise<void> {
  const backup = parseBackup(JSON.stringify(candidate));
  if (await storage.getItem(RESTORE_JOURNAL_KEY) !== null) throw new RecoveryRequiredError("Finish recovering your previous data before restoring another backup.");
  const original = await readRecords(storage);
  const journal = JSON.stringify({ version: 1, original });
  if (journal.length > MAX_BACKUP_BYTES * 2) throw new Error("Current saved data is too large to safely protect. No data was changed.");
  try {
    await storage.setItem(RESTORE_JOURNAL_KEY, journal);
    if (await storage.getItem(RESTORE_JOURNAL_KEY) !== journal) throw new Error("Could not protect the current data.");
  } catch {
    try { await clearJournal(storage); }
    catch { throw new RecoveryRequiredError("The restore did not start, but recovery information could not be cleared. Retry recovery before continuing."); }
    throw new Error("Could not protect your current data, so the restore did not start.");
  }
  try {
    await applyRecords(storage, backup.records);
  } catch {
    try { await applyRecords(storage, original); await clearJournal(storage); }
    catch { throw new RecoveryRequiredError("Restore stopped, and your previous data still needs recovery. Keep the app installed and retry recovery."); }
    throw new Error("Restore did not finish. Your previous saved data was recovered; nothing from the backup was kept.");
  }
  // All imported records are now verified. Never start rollback after removing the
  // durable journal: a failed cleanup read could otherwise leave unjournaled mixed data.
  try { await clearJournal(storage); }
  catch { throw new RecoveryRequiredError("Saved data was written, but restore cleanup could not be verified. Retry recovery before continuing."); }
}
