import type { SiteConfig } from './types';

/*
  Данные владельца сайта. Заполни пустые поля настоящими данными.
  Пока обязательные поля пустые, production-сборка остановится с понятной ошибкой
  (см. src/lib/config-guard.ts) — так заглушки не попадут в опубликованную версию.
*/
export const siteConfig: SiteConfig = {
  name: 'Сергей Чукавин',
  role: 'Full-stack веб-разработчик',
  city: 'Уфа',
  region: 'Республика Башкортостан',
  workArea: 'по всей России',
  contacts: {
    telegram: 'sergeychukavin',
    email: '',
  },
  about: {
    experience: '',
  },
  stack: [],
  legal: {
    operatorName: 'Чукавин Сергей Андреевич',
    policyDate: '2026-10-12',
  },
};

/** Список незаполненных обязательных полей — используется в dev-баннере и проверке сборки */
export function missingConfigFields(config: SiteConfig = siteConfig): string[] {
  const missing: string[] = [];
  if (!config.name.trim()) missing.push('siteConfig.name — настоящее имя');
  if (!config.contacts.telegram?.trim() && !config.contacts.email?.trim())
    missing.push('siteConfig.contacts — Telegram или email');
  if (!config.legal.operatorName.trim()) missing.push('siteConfig.legal.operatorName — ФИО для политики ПДн');
  return missing;
}

export const telegramUrl = (username?: string) => (username ? `https://t.me/${username.replace(/^@/, '')}` : undefined);
