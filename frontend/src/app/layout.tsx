import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  display: 'swap', // Tối ưu font loading
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Multilingual Flashcard App',
  description: 'Learn Chinese, Japanese, Korean, and English with flashcards',
  icons: {
    icon: '/favicon.png',
  },
  manifest: '/manifest.json', // PWA support
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Flashcard App',
  },
  formatDetection: {
    telephone: false, // Tránh tự động format số điện thoại
  },
};

// Viewport configuration cho responsive tốt hơn
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Cho phép zoom
  userScalable: true,
  viewportFit: 'cover', // Hỗ trợ notch/dynamic island
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
        // Prevent double-tap zoom trên iOS
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Safe area cho notch/dynamic island */}
        <div className="min-h-screen pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right">
          <Providers>
            {/* Main content với responsive container */}
            <main className="relative flex flex-col min-h-screen">
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  );
}