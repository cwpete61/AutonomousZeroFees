import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orbis Outreach — Autonomous Lead Generation',
  description: 'AI-powered lead discovery, outreach, and web design fulfillment. Find businesses with bad websites, close deals, and deliver sites — all on autopilot.',
  openGraph: {
    title: 'Orbis Outreach — Autonomous Lead Generation',
    description: 'AI-powered lead discovery, outreach, and web design fulfillment. Zero manual work.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
