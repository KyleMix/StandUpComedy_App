const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

type Key = string;

const memoryStore = new Map<Key, { count: number; expires: number }>();

export function rateLimit(key: Key) {
  const now = Date.now();
  const existing = memoryStore.get(key);
  if (!existing || existing.expires < now) {
    memoryStore.set(key, { count: 1, expires: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= MAX_REQUESTS) {
    return false;
  }
  existing.count += 1;
  memoryStore.set(key, existing);
  return true;
}
