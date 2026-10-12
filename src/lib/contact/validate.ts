/*
  Проверка заявки. Один и тот же код работает в браузере (подсказки до отправки)
  и на сервере (окончательная проверка) — без внешних зависимостей, чтобы не утяжелять страницу.
*/

export const contactMethods = {
  telegram: 'Telegram',
  phone: 'Телефон',
  email: 'Email',
} as const;

export const projectTypes = {
  site: 'Сайт',
  automation: 'Автоматизация',
  bot: 'Telegram-бот',
  ai: 'ИИ-функции',
  improvement: 'Доработка существующего проекта',
  other: 'Пока не знаю / другое',
} as const;

export const budgets = {
  '': 'Не указан',
  'lt-50': 'До 50 000 ₽',
  '50-150': '50 000 – 150 000 ₽',
  '150-300': '150 000 – 300 000 ₽',
  'gt-300': 'Больше 300 000 ₽',
} as const;

export type ContactMethod = keyof typeof contactMethods;
export type ProjectType = keyof typeof projectTypes;
export type Budget = keyof typeof budgets;

export interface ContactInput {
  name: string;
  method: ContactMethod;
  contact: string;
  projectType: ProjectType;
  message: string;
  budget: Budget;
  consent: boolean;
}

export type FieldErrors = Partial<Record<keyof ContactInput, string>>;

export const LIMITS = { name: [2, 80], contact: [3, 120], message: [10, 3000] } as const;

const has = <T extends object>(obj: T, key: unknown): key is keyof T =>
  typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEGRAM = /^(?:@|https?:\/\/t\.me\/|t\.me\/)?([a-zA-Z][a-zA-Z0-9_]{4,31})$/;

export function checkContact(method: ContactMethod, value: string): string | undefined {
  if (!value) return 'Укажите, как с вами связаться';
  if (method === 'email' && !EMAIL.test(value)) return 'Похоже, в адресе почты ошибка';
  if (method === 'telegram' && !TELEGRAM.test(value)) return 'Укажите username, например @username';
  if (method === 'phone') {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15 || /[^\d\s()+-]/.test(value)) return 'Похоже, в номере ошибка';
  }
  return undefined;
}

export function validateContact(
  raw: Record<string, unknown>,
): { ok: true; data: ContactInput } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const name = str(raw.name);
  const contact = str(raw.contact);
  const message = str(raw.message);
  const method = has(contactMethods, raw.method) ? raw.method : undefined;
  const projectType = has(projectTypes, raw.projectType) ? raw.projectType : undefined;
  const budget = has(budgets, raw.budget ?? '') ? ((raw.budget ?? '') as Budget) : undefined;
  const consent = raw.consent === true || raw.consent === 'on' || raw.consent === 'true';

  if (name.length < LIMITS.name[0]) errors.name = 'Как к вам обращаться?';
  else if (name.length > LIMITS.name[1]) errors.name = 'Слишком длинное имя';

  if (!method) errors.method = 'Выберите способ связи';
  else {
    const e = contact.length > LIMITS.contact[1] ? 'Слишком длинное значение' : checkContact(method, contact);
    if (e) errors.contact = e;
  }

  if (!projectType) errors.projectType = 'Выберите тип проекта';

  if (message.length < LIMITS.message[0]) errors.message = 'Опишите задачу хотя бы в паре предложений';
  else if (message.length > LIMITS.message[1]) errors.message = `Не больше ${LIMITS.message[1]} символов`;

  if (budget === undefined) errors.budget = 'Выберите вариант из списка';
  if (!consent) errors.consent = 'Нужно согласие на обработку персональных данных';

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: { name, method: method!, contact, projectType: projectType!, message, budget: budget!, consent },
  };
}
