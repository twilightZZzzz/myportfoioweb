import { test } from '@playwright/test';

/* Кадры анимаций для визуальной проверки: MOTION=1 npx playwright test motion-shots */
test.describe('кадры анимаций', () => {
  test.skip(!process.env.MOTION, 'только по запросу');
  test.use({ reducedMotion: 'no-preference' });

  test('главная', async ({ page }, info) => {
    test.setTimeout(120_000);
    const dir = `qa-shots/motion/${info.project.name}`;
    await page.goto('/');
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${dir}/00-leader.png` });
    await page.waitForTimeout(3600);
    await page.mouse.move(500, 520);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${dir}/01-hero.png` });

    const shots: [string, number][] = [
      ['02-marquee-manifesto', 1000],
      ['03-manifesto', 700],
      ['04-flow-a', 900],
      ['05-flow-b', 900],
      ['06-flow-c', 900],
      ['07-flow-d', 900],
      ['08-after-flow', 900],
      ['09-services', 900],
      ['10-caps', 1000],
      ['11-process', 900],
      ['12-about', 1000],
      ['13-faq', 1000],
      ['14-finale', 1000],
      ['15-form', 900],
      ['16-credits', 1200],
    ];
    for (const [name, dy] of shots) {
      await page.mouse.wheel(0, dy);
      await page.waitForTimeout(1300);
      await page.screenshot({ path: `${dir}/${name}.png` });
    }
  });

  test('внутренняя страница', async ({ page }, info) => {
    await page.goto('/services/automation');
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `qa-shots/motion/${info.project.name}/20-service-hero.png` });
  });
});
