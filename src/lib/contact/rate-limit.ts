/**
 * Ограничение частоты: не больше `limit` запросов с одного адреса за `windowMs`.
 *
 * Хранилище в памяти: на Vercel у каждого экземпляра функции оно своё,
 * поэтому это защита от простого флуда, а не строгий лимит. Для строгого лимита
 * добавь правило Rate Limiting в Vercel Firewall на путь /api/contact.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  return {
    check(key: string, now = Date.now()): { allowed: boolean; retryAfterSec: number } {
      const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { allowed: false, retryAfterSec: Math.ceil((windowMs - (now - recent[0]!)) / 1000) };
      }
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < windowMs)) hits.delete(k);
      return { allowed: true, retryAfterSec: 0 };
    },
  };
}
