import { expect, test } from '@playwright/test';

/* Анимации включены: проверяем, что кинематографический слой не ломает сайт */
test.describe('анимации', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('отсчёт на главной пропускается по Esc, ошибок в консоли нет', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => m.type() === 'error' && errors.push(m.text()));
    // часы браузера под контролем теста — отсчёт не успеет закончиться сам при медленной загрузке
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 60_000));
    await page.goto('/');
    const leader = page.locator('[data-leader]');
    await expect(leader).toBeVisible();
    await page.keyboard.press('Escape');
    await page.clock.runFor(3000);
    await expect(leader).toHaveCount(0, { timeout: 12000 });
    await expect(page.locator('[data-hero-title]')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('отсчёт показывается один раз за сессию', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-leader]')).toHaveCount(0, { timeout: 12000 });
    await page.goto('/');
    await expect(page.locator('[data-leader]')).toBeHidden();
  });

  test('шторка переводит на нужную страницу и открывает её', async ({ page, isMobile }) => {
    test.skip(isMobile, 'навигация на телефоне — через меню, проверено отдельно');
    await page.addInitScript(() => sessionStorage.setItem('leader-seen', '1'));
    await page.goto('/');
    await page.locator('.header__nav').getByRole('link', { name: 'Услуги' }).click();
    await expect(page).toHaveURL(/\/services$/);
    await expect(page.locator('[data-curtain]')).not.toBeInViewport({ timeout: 4000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('заголовки раскрываются, контент не остаётся скрытым', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('leader-seen', '1'));
    await page.goto('/services/telegram-bots');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const faq = page.getByRole('heading', { name: 'Частые вопросы', exact: true });
    await faq.scrollIntoViewIfNeeded();
    await expect(faq).toBeVisible();
  });
});
