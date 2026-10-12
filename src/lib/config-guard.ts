import type { AstroIntegration } from 'astro';
import { missingConfigFields } from '../data/site';

/**
 * Останавливает production-сборку, если не заполнены обязательные данные владельца
 * или не задан домен. Обойти можно только явно: ALLOW_INCOMPLETE_CONFIG=1 (для проверок).
 */
export function configGuard(): AstroIntegration {
  return {
    name: 'config-guard',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const problems = missingConfigFields();
        if (!process.env.SITE_URL) problems.push('переменная окружения SITE_URL — домен сайта');
        if (!problems.length) return;
        const text = `Сайт нельзя публиковать с незаполненными данными:\n  - ${problems.join('\n  - ')}`;
        if (process.env.ALLOW_INCOMPLETE_CONFIG === '1') {
          logger.warn(text + '\n(сборка продолжена, потому что ALLOW_INCOMPLETE_CONFIG=1)');
          return;
        }
        throw new Error(text);
      },
    },
  };
}
