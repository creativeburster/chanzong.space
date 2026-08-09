import './globals.css';
import type { Metadata, Viewport } from 'next';
import { LangProvider } from '@/context/LangContext';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';

export const metadata: Metadata = {
  title: '禅宗知识库 | ChanZong.space',
  description: '全量收录七佛传法偈、达摩四论、六祖坛经、黄檗传心法要及高丽国普照知呐禅师《真心直说》《修心诀》等 27 部核心禅宗典籍。',
  keywords: ['禅宗', '禅宗知识库', '真心直说', '修心诀', '六祖坛经', '达摩四论', '黄檗传心法要', 'ChanZong'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/icons/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '禅宗知识库',
  },
};

export const viewport: Viewport = {
  themeColor: '#0F172A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Serif+SC:wght@400;600;700;900&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#0F172A" />
      </head>
      <body className="bg-[#FAF9F6] text-zinc-900 font-sans antialiased selection:bg-amber-900 selection:text-white">
        <LangProvider>
          {children}
          <PWAInstallBanner />
        </LangProvider>
      </body>
    </html>
  );
}
