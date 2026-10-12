import { budgets, contactMethods, projectTypes, type ContactInput } from './validate';

export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function formatLead(d: ContactInput, meta: { page?: string; at?: Date } = {}): string {
  const lines = [
    '<b>Новая заявка с сайта</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(d.name)}`,
    `<b>${contactMethods[d.method]}:</b> ${escapeHtml(d.contact)}`,
    `<b>Тип проекта:</b> ${projectTypes[d.projectType]}`,
  ];
  if (d.budget) lines.push(`<b>Бюджет:</b> ${budgets[d.budget]}`);
  lines.push('', escapeHtml(d.message));
  const footer = [meta.page && `Страница: ${escapeHtml(meta.page)}`, meta.at && meta.at.toISOString()].filter(Boolean);
  if (footer.length) lines.push('', `<i>${footer.join(' · ')}</i>`);
  // Лимит Telegram — 4096 символов на сообщение
  const text = lines.join('\n');
  return text.length > 4000 ? text.slice(0, 3990) + '…' : text;
}

export async function sendToTelegram(
  text: string,
  { token, chatId, fetchImpl = fetch }: { token: string; chatId: string; fetchImpl?: typeof fetch },
): Promise<void> {
  const res = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Telegram API ответил ${res.status}`);
}
