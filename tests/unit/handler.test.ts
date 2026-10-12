import { describe, expect, it, vi } from 'vitest';
import { handleContact, MIN_FILL_MS } from '../../src/lib/contact/handler';
import { createRateLimiter } from '../../src/lib/contact/rate-limit';
import { escapeHtml, formatLead } from '../../src/lib/contact/telegram';

const NOW = 1_800_000_000_000;
const body = {
  name: 'Анна',
  method: 'email',
  contact: 'anna@example.ru',
  projectType: 'bot',
  message: 'Нужен бот для записи клиентов на замер.',
  budget: '50-150',
  consent: true,
  startedAt: NOW - 60_000,
  page: '/contact',
};

const req = (data: unknown, ip = '1.2.3.4', type = 'application/json') =>
  new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': type, 'x-forwarded-for': ip },
    body: typeof data === 'string' ? data : JSON.stringify(data),
  });

const okFetch = () => vi.fn(async () => new Response('{"ok":true}', { status: 200 })) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
const deps = (extra = {}) => ({
  token: 'T',
  chatId: '42',
  now: () => NOW,
  limiter: createRateLimiter({ limit: 5, windowMs: 600_000 }),
  log: () => {},
  ...extra,
});

describe('handleContact', () => {
  it('отправляет корректную заявку в Telegram', async () => {
    const fetchImpl = okFetch();
    const res = await handleContact(req(body), deps({ fetchImpl }));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(String(url)).toBe('https://api.telegram.org/botT/sendMessage');
    const sent = JSON.parse((init as RequestInit).body as string);
    expect(sent.chat_id).toBe('42');
    expect(sent.text).toContain('anna@example.ru');
    expect(sent.text).toContain('Telegram-бот');
  });

  it('принимает обычную HTML-форму', async () => {
    const fetchImpl = okFetch();
    const form = new URLSearchParams({ ...body, consent: 'on', startedAt: String(body.startedAt) } as Record<string, string>);
    const res = await handleContact(req(form.toString(), '1.1.1.1', 'application/x-www-form-urlencoded'), deps({ fetchImpl }));
    expect(res.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('возвращает ошибки валидации и ничего не отправляет', async () => {
    const fetchImpl = okFetch();
    const res = await handleContact(req({ ...body, contact: 'не почта' }), deps({ fetchImpl }));
    expect(res.status).toBe(422);
    expect(res.body.ok).toBe(false);
    if (!res.body.ok && res.body.code === 'validation') expect(res.body.errors.contact).toBeTruthy();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('молча отбрасывает заявку с заполненной ловушкой', async () => {
    const fetchImpl = okFetch();
    const res = await handleContact(req({ ...body, website: 'http://spam' }), deps({ fetchImpl }));
    expect(res.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('молча отбрасывает слишком быстрое заполнение', async () => {
    const fetchImpl = okFetch();
    const res = await handleContact(req({ ...body, startedAt: NOW - MIN_FILL_MS + 100 }), deps({ fetchImpl }));
    expect(res.status).toBe(200);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('ограничивает частоту запросов с одного адреса', async () => {
    const d = deps({ fetchImpl: okFetch(), limiter: createRateLimiter({ limit: 2, windowMs: 600_000 }) });
    expect((await handleContact(req(body), d)).status).toBe(200);
    expect((await handleContact(req(body), d)).status).toBe(200);
    const blocked = await handleContact(req(body), d);
    expect(blocked.status).toBe(429);
    expect(blocked.headers?.['retry-after']).toBeTruthy();
    expect((await handleContact(req(body, '5.6.7.8'), d)).status).toBe(200);
  });

  it('честно сообщает, если форма не настроена', async () => {
    const res = await handleContact(req(body), deps({ token: undefined }));
    expect(res.status).toBe(503);
  });

  it('сообщает об ошибке доставки', async () => {
    const fetchImpl = vi.fn(async () => new Response('fail', { status: 500 })) as unknown as typeof fetch;
    const res = await handleContact(req(body), deps({ fetchImpl }));
    expect(res.status).toBe(502);
  });

  it('отвечает 400 на нечитаемое тело', async () => {
    expect((await handleContact(req('{oops'), deps())).status).toBe(400);
    expect((await handleContact(req('[1,2]'), deps())).status).toBe(400);
  });
});

describe('formatLead', () => {
  it('экранирует HTML из пользовательского ввода', () => {
    const text = formatLead({
      name: '<b>Хакер</b>',
      method: 'email',
      contact: 'a@b.ru',
      projectType: 'site',
      message: '<script>alert(1)</script> & ещё',
      budget: '',
      consent: true,
    });
    expect(text).not.toContain('<script>');
    expect(text).toContain('&lt;script&gt;');
    expect(text).toContain('&amp; ещё');
    expect(text).not.toContain('Бюджет');
  });

  it('укладывается в лимит Telegram', () => {
    const text = formatLead({ name: 'А', method: 'email', contact: 'a@b.ru', projectType: 'site', message: 'х'.repeat(5000), budget: '', consent: true });
    expect(text.length).toBeLessThanOrEqual(4000);
  });

  it('escapeHtml', () => expect(escapeHtml('a<b>&c')).toBe('a&lt;b&gt;&amp;c'));
});

describe('rate limiter', () => {
  it('освобождает лимит после окна', () => {
    const l = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(l.check('x', 0).allowed).toBe(true);
    expect(l.check('x', 500).allowed).toBe(false);
    expect(l.check('x', 1500).allowed).toBe(true);
  });
});
