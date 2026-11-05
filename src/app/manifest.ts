import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TODOMU OSH Compliance Platform',
    short_name: 'TODOMU',
    description: 'Kenyan OSHA 2007 and DOSHS compliance for SMEs.',
    start_url: '/app',
    display: 'standalone',
    background_color: '#1b4332',
    theme_color: '#1b4332',
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png' },
      { src: '/icon', sizes: '512x512', type: 'image/png' },
    ],
  };
}
