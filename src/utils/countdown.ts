/** Pausable deadline. Expiry never depends on an animation completion callback. */
export function createCountdown(duration: number, onExpire: () => void) {
  let remaining = duration;
  let startedAt: number | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;
  function pause() {
    if (timeout !== null) clearTimeout(timeout);
    timeout = null;
    if (startedAt !== null) remaining = Math.max(0, remaining - (Date.now() - startedAt));
    startedAt = null;
    return remaining;
  }
  return {
    pause,
    resume() {
      if (disposed || startedAt !== null) return remaining;
      startedAt = Date.now();
      timeout = setTimeout(() => {
        timeout = null;
        startedAt = null;
        remaining = 0;
        disposed = true;
        onExpire();
      }, remaining);
      return remaining;
    },
    dispose() { pause(); disposed = true; },
  };
}
