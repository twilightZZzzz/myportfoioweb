import { getCollection, type CollectionEntry } from 'astro:content';
import type { ProjectCategory } from '../data/types';

export type Project = CollectionEntry<'projects'>;

export const categoryLabels: Record<ProjectCategory, string> = {
  sites: 'Сайты',
  automation: 'Автоматизация',
  bots: 'Telegram-боты',
  ai: 'ИИ',
};

export const statusLabels = {
  demo: 'Демонстрационный проект',
  commercial: 'Коммерческий проект',
  product: 'Собственный продукт',
} as const;

/**
 * Черновики (draft: true) никогда не попадают в production-сборку.
 * Посмотреть их локально: SHOW_DRAFTS=1 npm run dev
 */
export const showDrafts = () => import.meta.env.DEV && process.env.SHOW_DRAFTS === '1';
export const isVisible = (p: { data: { draft: boolean } }, drafts = showDrafts()) => drafts || !p.data.draft;

export const sortProjects = <T extends { data: { featured: boolean; publishedAt: Date } }>(list: T[]) =>
  [...list].sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || +b.data.publishedAt - +a.data.publishedAt);

export async function getProjects(): Promise<Project[]> {
  return sortProjects((await getCollection('projects')).filter(p => isVisible(p)));
}

export async function getProjectsByCategory(category: ProjectCategory) {
  return (await getProjects()).filter(p => p.data.category === category);
}
