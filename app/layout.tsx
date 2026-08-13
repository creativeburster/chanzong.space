import './globals.css';
import type { Metadata, Viewport } from 'next';
import { LangProvider } from '@/context/LangContext';
import { PWAInstallBanner } from '@/components/PWAInstallBanner';
import { Noto_Serif_SC, Inter } from 'next/font/google';

const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif-sc',
});

const inter = Inter({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const SITE_URL = 'https://chanzong.space';

export const metadata: Metadata = {
  title: {
    default: '禅宗知识库 | ChanZong.space',
    template: '%s | 禅宗知识库',
  },
  description: '全量收录44部核心禅宗典籍——七佛传法偈、达摩四论、六祖坛经、黄檗传心法要、无门关、八识规矩颂、禅关策进、大乘起信论、圜悟心要、圆悟佛果禅师语录及高丽普照知讷禅师《真心直说》《修心诀》等，含196个核心概念、240则公案、119位祖师、43种修持法门、660条问答。',
  keywords: ['禅宗', '禅宗知识库', '真心直说', '修心诀', '六祖坛经', '达摩四论', '黄檗传心法要', '无门关', '八识规矩颂', '禅关策进', '大乘起信论', '公案', '禅宗典籍', 'ChanZong', 'Zen Buddhism', '见性成佛', '顿悟', '止观', '看话头', '参禅', '禅修', '祖师语录'],
  manifest: '/manifest.json',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '禅宗知识库',
    title: '禅宗知识库 | ChanZong.space',
    description: '全量收录44部核心禅宗典籍，含196个概念、240则公案、119位祖师、43种法门、660条问答。传承顿悟见性之道。',
    url: SITE_URL,
    images: [
      {
        url: '/logo-nianhua-new.jpg',
        width: 1200,
        height: 630,
        alt: '禅宗知识库 ChanZong.space',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '禅宗知识库 | ChanZong.space',
    description: '全量收录44部核心禅宗典籍，含196个概念、240则公案、119位祖师、43种法门。',
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '禅宗知识库',
    alternateName: 'ChanZong.space',
    url: SITE_URL,
    description: '全量收录44部核心禅宗典籍，含196个概念、240则公案、119位祖师、43种法门、660条问答。传承顿悟见性之道。',
    inLanguage: 'zh-CN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/books`,
      },
      'query-input': 'required name=search-term-string',
    },
  };

  return (
    <html lang="zh-CN" className={`scroll-smooth ${notoSerifSC.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#0F172A" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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