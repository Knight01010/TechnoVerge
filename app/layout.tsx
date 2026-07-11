import type { Metadata, Viewport } from 'next';
import { Chakra_Petch, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/providers/AppProviders';

const chakra = Chakra_Petch({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-chakra',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MS Technoverge — AI, Secured.',
  description:
    'MS Technoverge helps organisations find the AI worth building, ship it to production, and protect it from cyber threats — on infrastructure engineered to hold. AI advisory, cybersecurity assurance, and network & infrastructure services from one accountable partner.',
  keywords: [
    'AI transformation',
    'cybersecurity',
    'AI advisory',
    'network infrastructure',
    'zero trust',
    'AI governance',
  ],
  openGraph: {
    title: 'MS Technoverge — AI, Secured.',
    description:
      'AI ambition, zero compromise. AI transformation advisory and cybersecurity assurance from one accountable partner.',
    type: 'website',
    siteName: 'MS Technoverge',
  },
};

export const viewport: Viewport = {
  themeColor: '#050607',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variable classes must live on <html>: globals.css composes them
    // into --font-display/--font-mono at :root, which cannot see variables
    // defined lower in the tree.
    <html lang="en" className={`${chakra.variable} ${plexMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
