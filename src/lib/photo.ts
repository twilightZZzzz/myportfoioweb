import type { ImageMetadata } from 'astro';
import { siteConfig } from '../data/site';

const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/about/*.{jpg,jpeg,png,webp,avif}');

/** Фото владельца из src/assets/about — или undefined, если фото не задано */
export async function getOwnerPhoto(): Promise<ImageMetadata | undefined> {
  if (!siteConfig.photo) return undefined;
  const loader = images[`/src/assets/${siteConfig.photo.replace(/^\/?(src\/)?(assets\/)?/, '')}`];
  if (!loader) throw new Error(`Фото не найдено: src/assets/${siteConfig.photo}`);
  return (await loader()).default;
}
