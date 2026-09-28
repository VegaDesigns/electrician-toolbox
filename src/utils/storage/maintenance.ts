/** Storage participants finish pending saves before a backup captures or replaces data. */
type Participant = { settle(): Promise<void>; reset(): void };
const participants = new Set<Participant>();
let preparing = false;
export function registerStorageParticipant(participant: Participant) { participants.add(participant); return () => { participants.delete(participant); }; }
export function isStoragePreparing() { return preparing; }
export async function withSettledStorage<T>(operation: () => Promise<T>): Promise<T> {
  if (preparing) throw new Error("Another backup operation is already running.");
  preparing = true;
  try {
    await Promise.all([...participants].map(participant => participant.settle()));
    return await operation();
  } finally { preparing = false; }
}
export function resetStorageParticipants() { participants.forEach(participant => participant.reset()); }
