import type { Metadata } from 'next';
import { IBM_Plex_Sans, JetBrains_Mono, Outfit } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
});

const display = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'Productivity Consulting Limited — OSH, Environment & Productivity OSHAPP',
  description:
    'Kenyan training and consulting in productivity, occupational safety & health, and environmental compliance. Open Productivity OSHAPP, our OSHA 2007 platform for SMEs.',
  appleWebApp: {
    capable: true,
    title: 'Productivity OSHAPP',
    statusBarStyle: 'default',
  },
};

export const viewport = {
  themeColor: '#1b4332',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} ${mono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
