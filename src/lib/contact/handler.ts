import { validateContact, type FieldErrors } from './validate';
import { formatLead, sendToTelegram } from './telegram';
import { createRateLimiter } from './rate-limit';

export interface ContactDeps {
  token?: string;
  chatId?: string;
  fetchImpl?: typeof fetch;
  limiter?: ReturnType<typeof createRateLimiter>;
  now?: () => number;
  log?: (msg: string, err?: unknown) => void;
}

export type ContactResponse =
  | { ok: true }
  | { ok: false; code: 'validation'; errors: FieldErrors; message: string }
  | { ok: false; code: 'rate_limited' | 'unavailable' | 'delivery_failed' | 'bad_request'; message: string };

/** Минимальное время заполнения формы человеком; быстрее — почти наверняка бот */
export const MIN_FILL_MS = 2500;

const defaultLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const type = request.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) {
      const body: unknown = await request.json();
      return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
    }
    if (type.includes('form')) return Object.fromEntries((await request.formData()).entries());
  } catch {
    return null;
  }
  return null;
}

export function clientKey(request: Request): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

/** Обработка заявки. Возвращает HTTP-статус и тело ответа; транспорт — в src/pages/api/contact.ts */
export async function handleContact(
  request: Request,
  deps: ContactDeps = {},
): Promise<{ status: number; body: ContactResponse; headers?: Record<string, string> }> {
  const { token, chatId, fetchImpl, limiter = defaultLimiter, now = Date.now, log = console.error } = deps;

  const raw = await readBody(request);
  if (!raw) return { status: 400, body: { ok: false, code: 'bad_request', message: 'Не удалось прочитать форму' } };

  // Ловушка для ботов: скрытое поле, которое человек не видит и не заполняет.
  // Боту отвечаем «успехом», чтобы он не подбирал обход.
  if (typeof raw.website === 'string' && raw.website.trim() !== '') return { status: 200, body: { ok: true } };
  const startedAt = Number(raw.startedAt);
  if (Number.isFinite(startedAt) && startedAt > 0 && now() - startedAt < MIN_FILL_MS) return { status: 200, body: { ok: true } };

  const rate = limiter.check(clientKey(request), now());
  if (!rate.allowed) {
    return {
      status: 429,
      headers: { 'retry-after': String(rate.retryAfterSec) },
      body: { ok: false, code: 'rate_limited', message: 'Слишком много заявок подряд. Попробуйте через несколько минут или напишите напрямую.' },
    };
  }

  const result = validateContact(raw);
  if (!result.ok) {
    return { status: 422, body: { ok: false, code: 'validation', errors: result.errors, message: 'Проверьте поля формы' } };
  }

  if (!token || !chatId) {
    log('Форма не настроена: нет TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID');
    return { status: 503, body: { ok: false, code: 'unavailable', message: 'Форма временно не работает. Напишите напрямую — контакты ниже.' } };
  }

  try {
    const page = typeof raw.page === 'string' ? raw.page.slice(0, 200) : undefined;
    await sendToTelegram(formatLead(result.data, { page, at: new Date(now()) }), { token, chatId, fetchImpl });
  } catch (err) {
    log('Не удалось доставить заявку в Telegram', err);
    return { status: 502, body: { ok: false, code: 'delivery_failed', message: 'Не удалось отправить заявку. Попробуйте ещё раз или напишите напрямую.' } };
  }

  return { status: 200, body: { ok: true } };
}
