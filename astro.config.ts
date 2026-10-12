import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { configGuard } from './src/lib/config-guard';

// Домен сайта задаётся переменной окружения SITE_URL (например https://example.ru).
// Он нужен для canonical, OpenGraph и sitemap.
const site = process.env.SITE_URL || 'http://localhost:4321';

export default defineConfig({
  site,
  trailingSlash: 'never',
  output: 'static',
  // в e2e-тестах тулбар разработчика не нужен: он добавляет свои элементы на страницу
  devToolbar: { enabled: !process.env.E2E },
  adapter: vercel(),
  // CSS сайта небольшой — встраиваем в страницу, чтобы не блокировать первый рендер
  build: { inlineStylesheets: 'always' },
  env: {
    schema: {
      // Секреты читаются только на сервере во время выполнения и не попадают в браузер
      TELEGRAM_BOT_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      TELEGRAM_CHAT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    configGuard(),
    sitemap({
      filter: page => !/\/contact\/(sent|error)$/.test(page) && !/\/(404|500)$/.test(page),
    }),
  ],
});
