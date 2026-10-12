import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { handleContact } from '../../lib/contact/handler';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const { status, body, headers } = await handleContact(request, {
    token: getSecret('TELEGRAM_BOT_TOKEN'),
    chatId: getSecret('TELEGRAM_CHAT_ID'),
  });

  // Без JavaScript форма отправляется обычным POST — отвечаем переходом на страницу результата
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  if (!wantsJson) return redirect(body.ok ? '/contact/sent' : '/contact/error', 303);

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
};

export const ALL: APIRoute = () =>
  new Response(JSON.stringify({ ok: false, message: 'Method Not Allowed' }), {
    status: 405,
    headers: { allow: 'POST', 'content-type': 'application/json; charset=utf-8' },
  });
