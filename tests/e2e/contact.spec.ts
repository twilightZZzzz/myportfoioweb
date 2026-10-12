import { expect, test, type Page } from '@playwright/test';

async function fillValid(page: Page) {
  await page.getByLabel('Имя', { exact: true }).fill('Анна');
  await page.getByLabel('Контакт').fill('@anna_test');
  await page.getByLabel('Коротко о задаче').fill('Нужен сайт для ремонтной компании с формой расчёта стоимости.');
  await page.getByLabel(/Даю согласие/).check();
}

test.describe('форма заявки', () => {
  test('пустая форма показывает ошибки и ставит фокус на первое поле', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Как к вам обращаться?')).toBeVisible();
    await expect(page.getByText('Нужно согласие на обработку персональных данных')).toBeVisible();
    await expect(page.getByLabel('Имя', { exact: true })).toBeFocused();
    await expect(page.getByLabel('Имя', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  });

  test('смена способа связи меняет подсказку и проверку', async ({ page }) => {
    await page.goto('/contact');
    await page.getByLabel('Как с вами связаться').selectOption('email');
    await expect(page.getByLabel('Контакт')).toHaveAttribute('placeholder', 'name@company.ru');
    await fillValid(page);
    await page.getByLabel('Контакт').fill('не почта');
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByText('Похоже, в адресе почты ошибка')).toBeVisible();
  });

  test('успешная отправка показывает подтверждение', async ({ page }) => {
    let payload: Record<string, unknown> = {};
    await page.route('**/api/contact', async route => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.goto('/contact');
    await page.waitForTimeout(300);
    await fillValid(page);
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByRole('heading', { name: 'Заявка отправлена' })).toBeVisible();
    expect(payload).toMatchObject({ name: 'Анна', method: 'telegram', contact: '@anna_test', consent: true, website: '' });
    expect(Number(payload.startedAt)).toBeGreaterThan(0);
  });

  test('ошибка сервера — понятное сообщение, данные остаются в форме', async ({ page }) => {
    await page.route('**/api/contact', route =>
      route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'delivery_failed', message: 'Не удалось отправить заявку.' }) }),
    );
    await page.goto('/contact');
    await fillValid(page);
    await page.getByRole('button', { name: 'Отправить заявку' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Не удалось отправить заявку' })).toBeVisible();
    await expect(page.getByLabel('Имя', { exact: true })).toHaveValue('Анна');
    await expect(page.getByRole('button', { name: 'Отправить заявку' })).toBeEnabled();
  });

  test('ссылка со страницы услуги заранее выбирает тип проекта', async ({ page }) => {
    await page.goto('/services/telegram-bots');
    await page.getByRole('link', { name: 'Обсудить задачу' }).click();
    await expect(page).toHaveURL(/type=bot/);
    await expect(page.getByLabel('Тип проекта')).toHaveValue('bot');
  });
});

test.describe('API заявок', () => {
  test.skip(({ isMobile }) => isMobile, 'API проверяем один раз');

  test('некорректные данные — 422 с ошибками полей', async ({ request }) => {
    const res = await request.post('/api/contact', { data: { name: 'А' }, headers: { accept: 'application/json', 'x-forwarded-for': '10.0.0.1' } });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors.name).toBeTruthy();
  });

  test('без настроенного бота — 503, а не ложный успех', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: { name: 'Анна', method: 'email', contact: 'a@b.ru', projectType: 'site', message: 'Проверка формы без токена.', budget: '', consent: true },
      headers: { accept: 'application/json', 'x-forwarded-for': '10.0.0.2' },
    });
    expect(res.status()).toBe(503);
  });

  test('GET не поддерживается', async ({ request }) => {
    expect((await request.get('/api/contact')).status()).toBe(405);
  });
});
