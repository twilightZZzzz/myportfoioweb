import { describe, expect, it, vi } from 'vitest';

vi.mock('astro:content', () => ({ getCollection: async () => [] }));
const { isVisible, sortProjects } = await import('../../src/lib/projects');

const p = (featured: boolean, date: string, draft = false) => ({ data: { featured, publishedAt: new Date(date), draft } });

describe('проекты', () => {
  it('черновики скрыты, если явно не включены', () => {
    expect(isVisible(p(false, '2026-01-01', true), false)).toBe(false);
    expect(isVisible(p(false, '2026-01-01', true), true)).toBe(true);
    expect(isVisible(p(false, '2026-01-01'), false)).toBe(true);
  });

  it('сначала избранные, затем новые', () => {
    const list = [p(false, '2026-05-01'), p(true, '2026-01-01'), p(false, '2026-09-01')];
    expect(sortProjects(list).map(x => [x.data.featured, x.data.publishedAt.getMonth() + 1])).toEqual([
      [true, 1],
      [false, 9],
      [false, 5],
    ]);
  });
});
