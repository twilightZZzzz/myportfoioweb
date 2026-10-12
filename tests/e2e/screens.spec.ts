import { test } from '@playwright/test';

/* Полностраничные скриншоты для визуальной проверки: SCREENS=1 npx playwright test screens */
const pages = ['/', '/services', '/services/web-development', '/services/automation', '/services/telegram-bots', '/services/ai-solutions', '/projects', '/projects/obrazec-keisa', '/about', '/contact', '/privacy', '/404'];

test.describe('скриншоты', () => {
  test.skip(!process.env.SCREENS, 'только по запросу');
  for (const path of pages) {
    test(path, async ({ page }, info) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const name = path === '/' ? 'home' : path.slice(1).replace(/\//g, '_');
      await page.screenshot({ path: `qa-shots/screens/${info.project.name}-${name}.png`, fullPage: true });
    });
  }
});
