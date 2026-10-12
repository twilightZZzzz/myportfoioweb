import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
  Проект = один файл src/content/projects/<slug>.md
  Имя файла становится адресом: /projects/<slug>.
  Необязательные поля можно не указывать — соответствующие блоки на странице не появятся.
*/
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      category: z.enum(['sites', 'automation', 'bots', 'ai']),
      industry: z.string(),
      /** Тип решения: «Лендинг», «Telegram-бот», «Интеграция» и т. п. */
      type: z.string(),
      /** demo — демонстрация · commercial — для заказчика · product — собственный продукт автора */
      status: z.enum(['demo', 'commercial', 'product']),
      role: z.string(),
      challenge: z.string(),
      /** true — задача смоделирована для демонстрации, а не пришла от заказчика */
      challengeSimulated: z.boolean().default(false),
      requirements: z.array(z.string()).default([]),
      solution: z.string(),
      decisions: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
      features: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
      stack: z.array(z.string()).default([]),
      cover: z.object({ src: image(), alt: z.string() }).optional(),
      /** Видео-трейлер кейса: файлы лежат в public/, постер — в src/assets */
      video: z
        .object({
          mp4: z.string(),
          mp4Small: z.string().optional(),
          poster: image(),
          label: z.string(),
        })
        .optional(),
      images: z.array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() })).default([]),
      integrations: z.array(z.object({ name: z.string(), purpose: z.string() })).default([]),
      architecture: z
        .object({ text: z.string().optional(), steps: z.array(z.object({ label: z.string(), note: z.string().optional() })).default([]) })
        .optional(),
      testing: z.object({ done: z.array(z.string()).default([]), limitations: z.array(z.string()).default([]) }).optional(),
      /** Что реализовано. Без коммерческих метрик, если их нет. */
      outcome: z.array(z.string()).default([]),
      demoUrl: z.url().optional(),
      repoUrl: z.url().optional(),
      featured: z.boolean().default(false),
      publishedAt: z.coerce.date(),
      /** Черновик виден только при локальной разработке */
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };
