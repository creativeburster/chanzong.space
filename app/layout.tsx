import './globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { LangProvider } from '@/context/LangContext';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { CopyrightCopyHandler } from '@/components/CopyrightCopyHandler';
import { STATS } from '@/lib/stats';
const SITE_URL = 'https://chanzong.space';

export const metadata: Metadata = {
  title: {
    default: '禅宗知识库 | 顿悟见性之道 | ChanZong.space',
    template: '%s | 禅宗知识库 ChanZong.space',
  },
  description: `禅宗知识库（chanzong.space）——收录${STATS.classics}部禅宗核心典籍，含${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种修持法门、${STATS.faqs}条问答。从达摩四论、六祖坛经到无门关、碧岩录，传承顿悟见性之道。`,
  keywords: ['禅宗', '禅宗知识库', '六祖坛经', '达摩四论', '黄檗传心法要', '无门关', '碧岩录', '禅关策进', '大乘起信论', '公案', '禅宗典籍', 'ChanZong', 'Zen Buddhism', '见性成佛', '顿悟', '止观', '看话头', '参禅', '禅修', '祖师语录'],
  manifest: '/manifest.json',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '禅宗知识库',
    title: '禅宗知识库 | 顿悟见性之道 | ChanZong.space',
    description: `收录${STATS.classics}部禅宗核心典籍，含${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门、${STATS.faqs}条问答。传承顿悟见性之道。`,
    url: SITE_URL,
    images: [
      {
        url: '/logo-nianhua-new.jpg',
        width: 512,
        height: 512,
        alt: '禅宗知识库',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '禅宗知识库 | 顿悟见性之道 | ChanZong.space',
    description: `收录${STATS.classics}部禅宗核心典籍，含${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门。`,
    images: ['/logo-nianhua-new.jpg'],
  },
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
    <html lang="zh-CN" className="scroll-smooth bg-[#FAF9F6] text-slate-900">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#0F172A" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zen_reading_theme');var d=t==='night'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.setAttribute('data-theme','night');document.documentElement.classList.add('dark');}else if(t==='bamboo'){document.documentElement.setAttribute('data-theme','bamboo');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-[#FAF9F6] text-zinc-900 font-sans antialiased selection:bg-amber-900 selection:text-white">
        <LangProvider>
          {children}
          <PWAInstallBanner />
          <CopyrightCopyHandler />
        </LangProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-E33EPY0QV7"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E33EPY0QV7');
          `}
        </Script>
      </body>
    </html>
  );
}