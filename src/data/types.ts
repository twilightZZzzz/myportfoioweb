/* Типизированные модели сайта. Модель Project описана схемой в src/content.config.ts. */

export type ServiceSlug = 'web-development' | 'automation' | 'telegram-bots' | 'ai-solutions';

/** Категории проектов — совпадают с фильтрами на /projects */
export type ProjectCategory = 'sites' | 'automation' | 'bots' | 'ai';

export interface FAQ {
  q: string;
  a: string;
}

/** Блок отзывов не выводится, пока нет настоящих отзывов с согласием автора */
export interface Testimonial {
  author: string;
  role?: string;
  company?: string;
  text: string;
  /** ссылка на проект, к которому относится отзыв */
  projectSlug?: string;
  /** подтверждение, что автор разрешил публикацию */
  consentToPublish: true;
}

export interface Step {
  label: string;
  note?: string;
}

export interface SolutionType {
  title: string;
  purpose: string;
  audience: string;
  includes: string[];
  features?: string[];
}

export interface Service {
  slug: ServiceSlug;
  /** Название в навигации и карточках */
  title: string;
  /** Главная услуга выделяется визуально */
  primary?: boolean;
  /** Иконка из src/components/Icon.astro */
  icon: 'browser' | 'flow' | 'bot' | 'spark';
  card: { text: string; points: string[] };
  projectCategory: ProjectCategory;
  seo: { title: string; description: string };
  hero: { h1: string; lead: string };
  intro?: { title: string; paragraphs: string[] };
  solutionTypes?: { title: string; items: SolutionType[] };
  scenarios?: { title: string; lead?: string; items: { title: string; text: string; steps?: string[] }[] };
  flow?: { title: string; lead?: string; steps: Step[] };
  dialog?: { title: string; lead?: string; messages: { from: 'bot' | 'user'; text: string }[] };
  capabilities?: { title: string; items: { title: string; text: string }[] };
  integrations?: { title: string; lead?: string; items: { title: string; text: string }[] };
  limits?: { title: string; lead?: string; items: string[] };
  security?: { title: string; items: string[] };
  pricingFactors?: { title: string; items: string[] };
  process: { title: string; steps: Step[] };
  faq: FAQ[];
}

export interface SiteConfig {
  /** Настоящее имя владельца — обязательно для публикации */
  name: string;
  role: string;
  city: string;
  region: string;
  workArea: string;
  /** Короткое имя бренда в шапке (по умолчанию — имя) */
  brand?: string;
  contacts: {
    /** username без @ */
    telegram?: string;
    email?: string;
    phone?: string;
  };
  /** Путь к фото в src/assets, например 'about/photo.jpg' — показывается, только если задано */
  photo?: string;
  about: {
    /** Честное описание опыта своими словами. Пустое — абзац не выводится */
    experience?: string;
  };
  /** Технологии, с которыми владелец реально работает */
  stack: { group: string; items: string[] }[];
  /** Данные для политики обработки персональных данных */
  legal: {
    /** ФИО оператора персональных данных */
    operatorName: string;
    /** ИНН — если есть статус самозанятого или ИП */
    inn?: string;
    /** Дата редакции политики, ГГГГ-ММ-ДД */
    policyDate: string;
  };
}
