type Bucket = { tokens: number; updatedAt: number };

const store = new Map<string, Bucket>();

const REFILL_INTERVAL_MS = 60_000;
const DEFAULT_LIMIT = 10;

export function rateLimit(
  key: string,
  limit = DEFAULT_LIMIT,
  windowMs = REFILL_INTERVAL_MS
): { ok: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now - bucket.updatedAt > windowMs) {
    store.set(key, { tokens: limit - 1, updatedAt: now });
    return { ok: true, remaining: limit - 1, resetMs: windowMs };
  }

  if (bucket.tokens <= 0) {
    return { ok: false, remaining: 0, resetMs: windowMs - (now - bucket.updatedAt) };
  }

  bucket.tokens -= 1;
  return { ok: true, remaining: bucket.tokens, resetMs: windowMs - (now - bucket.updatedAt) };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
