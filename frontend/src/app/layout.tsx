import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { RouteChangeIndicator } from '@/components/RouteChangeIndicator';

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Multilingual Flashcard App',
  description: 'Learn Chinese, Japanese, Korean, and English with flashcards',
  icons: {
    icon: '/favicon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Flashcard App',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className={inter.variable}>
      <body 
        className={`
          ${inter.className} 
          antialiased 
          min-h-screen 
          bg-background 
          text-foreground
          overflow-x-hidden
          touch-manipulation
        `}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Loading bar khi chuyển trang */}
        <RouteChangeIndicator />

        <div className="min-h-screen pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right">
          <Providers>
            <main className="relative flex flex-col min-h-screen">
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  );
}
