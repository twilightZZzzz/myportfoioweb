import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/services',
  '/services/web-development',
  '/services/automation',
  '/services/telegram-bots',
  '/services/ai-solutions',
  '/projects',
  '/projects/obrazec-keisa',
  '/about',
  '/contact',
  '/privacy',
  '/consent',
];

test.describe('маршруты', () => {
  for (const path of routes) {
    test(`${path} открывается, один h1, есть title и description`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      expect((await page.title()).length).toBeGreaterThan(5);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    });
  }

  test('несуществующая страница отдаёт 404', async ({ page }) => {
    const res = await page.goto('/net-takoy-stranicy');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Такой страницы нет');
  });

  test('уникальные title у страниц услуг', async ({ page }) => {
    const titles = new Set<string>();
    for (const path of routes.filter(r => r.startsWith('/services/'))) {
      await page.goto(path);
      titles.add(await page.title());
    }
    expect(titles.size).toBe(4);
  });

  test('на сайте нет битых внутренних ссылок', async ({ page, request }) => {
    const links = new Set<string>();
    for (const path of ['/', '/services', '/about', '/projects', '/services/telegram-bots']) {
      await page.goto(path);
      for (const href of await page.locator('a[href^="/"]').evaluateAll(as => as.map(a => a.getAttribute('href')!))) {
        links.add(href.split('#')[0]!.split('?')[0]!);
      }
    }
    for (const href of links) {
      if (!href) continue;
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
    }
  });
});

test.describe('навигация и доступность', () => {
  test('ссылка «Перейти к содержанию» — первая по Tab', async ({ page, isMobile }) => {
    test.skip(isMobile, 'клавиатура — на десктопе');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Перейти к содержанию' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('текущий раздел отмечен в шапке', async ({ page, isMobile }) => {
    test.skip(isMobile, 'на телефоне навигация в меню');
    await page.goto('/services/automation');
    await expect(page.locator('.header__nav a[aria-current="page"]')).toHaveText('Услуги');
  });

  test('мобильное меню: открывается, держит фокус, закрывается по Esc', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'бургер только на узких экранах');
    await page.goto('/');
    const burger = page.getByRole('button', { name: 'Открыть меню' });
    await burger.click();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('dialog', { name: 'Меню' });
    await expect(menu).toBeVisible();
    await expect(page.getByRole('button', { name: 'Закрыть меню' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(burger).toBeFocused();
  });

  test('мобильное меню ведёт на страницу', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'бургер только на узких экранах');
    await page.goto('/');
    await page.getByRole('button', { name: 'Открыть меню' }).click();
    await page.getByRole('dialog', { name: 'Меню' }).getByRole('link', { name: 'Обо мне' }).click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test('нет горизонтальной прокрутки', async ({ page }) => {
    for (const path of ['/', '/services/telegram-bots', '/projects/obrazec-keisa', '/contact']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('проекты', () => {
  test('фильтр показывает только выбранную категорию', async ({ page }) => {
    await page.goto('/projects');
    const sites = page.getByRole('button', { name: /^Сайты/ });
    await sites.click();
    await expect(sites).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/category=sites/);
    await expect(page.locator('[data-category="sites"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /^Автоматизация/ })).toBeDisabled();
  });

  test('шаблон кейса: статус, пометка о смоделированной задаче, галерея', async ({ page }) => {
    await page.goto('/projects/obrazec-keisa');
    await expect(page.getByText('Демонстрационный проект').first()).toBeVisible();
    await expect(page.getByText('Задача смоделирована для демонстрации')).toBeVisible();
    await page.getByRole('button', { name: 'Открыть изображение крупно' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Просмотр изображения' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('link', { name: 'Обсудить проект' }).last()).toHaveAttribute('href', '/contact');
  });
});
