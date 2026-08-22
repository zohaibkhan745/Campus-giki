import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  return ``;
}
export function getSocietyLogo(logoUrl?: string | null): string {
  if (!logoUrl) return '/giki-black.jpg';
  return resolveImageUrl(logoUrl);
}

export function getSocietyBanner(bannerUrl?: string | null): string {
  if (!bannerUrl) return '/giki-banner-disney.png';
  return resolveImageUrl(bannerUrl);
}

