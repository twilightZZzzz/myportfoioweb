import { describe, expect, it } from 'vitest';
import { services } from '../../src/data/services';
import { generalFaq } from '../../src/data/faq';
import { testimonials } from '../../src/data/testimonials';
import { missingConfigFields } from '../../src/data/site';
import type { SiteConfig } from '../../src/data/types';

const baseConfig: SiteConfig = {
  name: 'Иван Иванов',
  role: 'r',
  city: 'Уфа',
  region: 'РБ',
  workArea: 'по всей России',
  contacts: { telegram: 'ivan' },
  about: {},
  stack: [],
  legal: { operatorName: 'Иванов Иван Иванович', policyDate: '2026-10-12' },
};

describe('данные сайта', () => {
  it('четыре услуги с уникальными адресами, одна основная — разработка сайтов', () => {
    expect(services).toHaveLength(4);
    expect(new Set(services.map(s => s.slug)).size).toBe(4);
    expect(services.filter(s => s.primary).map(s => s.slug)).toEqual(['web-development']);
  });

  it('у каждой услуги есть процесс, FAQ и SEO', () => {
    for (const s of services) {
      expect(s.process.steps.length).toBeGreaterThan(0);
      expect(s.faq.length).toBeGreaterThan(0);
      expect(s.seo.title.length).toBeLessThanOrEqual(70);
      expect(s.seo.description.length).toBeLessThanOrEqual(200);
    }
  });

  it('общий FAQ покрывает стоимость, сроки, доработку, интеграции, географию и поддержку', () => {
    const qs = generalFaq.map(f => f.q.toLowerCase()).join(' ');
    for (const word of ['стоит', 'срок', 'доработать', 'интеграц', 'уф', 'поддержка']) expect(qs).toContain(word);
  });

  it('отзывов нет — блок не выводится, пока не появятся настоящие', () => {
    expect(testimonials).toEqual([]);
  });

  it('проверка конфигурации находит пустые обязательные поля', () => {
    expect(missingConfigFields(baseConfig)).toEqual([]);
    expect(missingConfigFields({ ...baseConfig, name: ' ' })).toHaveLength(1);
    expect(missingConfigFields({ ...baseConfig, contacts: {} })).toHaveLength(1);
    expect(missingConfigFields({ ...baseConfig, legal: { ...baseConfig.legal, operatorName: '' } })).toHaveLength(1);
  });
});
