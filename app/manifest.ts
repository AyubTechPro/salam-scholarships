import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://salamconsulting.com').replace(/\/+$/, '');

  return {
    name: 'Salam Scholarships Global Opportunity Platform',
    short_name: 'Salam Scholarships',
    description:
      'Discover scholarships, global programs, and university pathways in one place.',
    start_url: '/en',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#001A33',
    lang: 'en',
    categories: ['education', 'productivity'],
    icons: [],
    related_applications: [],
    prefer_related_applications: false,
    id: baseUrl,
  };
}
