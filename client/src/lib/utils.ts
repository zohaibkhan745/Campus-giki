import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return '';
  if (
    url.startsWith('http') ||
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('/default-') ||
    url.startsWith('/giki-')
  ) {
    return url;
  }
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    return url.startsWith('/') ? url : `/${url}`;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  const baseUrl = apiBase.replace(/\/api\/v1\/?$/, '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
export function getSocietyLogo(logoUrl?: string | null): string {
  if (!logoUrl) return '/default-society.jpg';
  return resolveImageUrl(logoUrl);
}

export function getSocietyBanner(bannerUrl?: string | null): string {
  if (!bannerUrl) return '/default-banner.png';
  return resolveImageUrl(bannerUrl);
}




export function getAdvisorLogo(logoUrl?: string | null): string {
  if (!logoUrl) return '/default-advisor.jpg';
  return resolveImageUrl(logoUrl);
}

