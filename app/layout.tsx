import './globals.css';
import type { Metadata, Viewport } from 'next';
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
        url: '/og-banner.jpg',
        width: 1200,
        height: 630,
        alt: '禅宗知识库',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '禅宗知识库 | 顿悟见性之道 | ChanZong.space',
    description: `收录${STATS.classics}部禅宗核心典籍，含${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门。`,
    images: ['/og-banner.jpg'],
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
  verification: {
    other: {
      'msvalidate.01': 'F238CD74AF5EBE0E4362F6C77DD3D999',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF9F6',
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
        <link rel="alternate" type="text/plain" href="https://chanzong.space/llms.txt" title="禅宗知识库 LLM AI Index" />
        <link rel="alternate" type="text/plain" href="https://chanzong.space/llms-full.txt" title="禅宗知识库 Full LLM Corpus" />
        <meta name="theme-color" content="#FAF9F6" />
        {/* Bing Webmaster Tools 验证 */}
        <meta name="msvalidate.01" content="F238CD74AF5EBE0E4362F6C77DD3D999" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zen_reading_theme');var d=t==='night'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.setAttribute('data-theme','night');document.documentElement.classList.add('dark');}else if(t==='bamboo'){document.documentElement.setAttribute('data-theme','bamboo');}}catch(e){}})();`,
          }}
        />
        {/* Google tag (gtag.js) - 防机房无头 Bot 精准熔断 & GA4 零延迟初始化 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var gaId = 'G-E33EPY0QV7';
                  var ua = navigator.userAgent || '';
                  var sw = window.screen ? window.screen.width : 0;
                  var sh = window.screen ? window.screen.height : 0;
                  var res = sw + 'x' + sh;
                  var botResolutions = {
                    '1280x1200': 1,
                    '1366x1366': 1,
                    '1280x1280': 1,
                    '1600x1600': 1,
                    '1280x1600': 1,
                    '1600x1200': 1,
                    '800x600': 1
                  };
                  var isBot = (navigator.webdriver === true) ||
                    /HeadlessChrome|PhantomJS|Playwright|Puppeteer|SlimerJS|CasperJS/i.test(ua) ||
                    (botResolutions[res] === 1) ||
                    (sw > 0 && sw === sh);

                  if (!isBot) {
                    try {
                      var canvas = document.createElement('canvas');
                      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                      if (gl) {
                        var ext = gl.getExtension('WEBGL_debug_renderer_info');
                        if (ext) {
                          var renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '';
                          if (/SwiftShader|llvmpipe|Software Rasterizer/i.test(renderer)) {
                            isBot = true;
                          }
                        }
                      }
                    } catch (_) {}
                  }

                  if (isBot) {
                    window['ga-disable-' + gaId] = true;
                    return;
                  }

                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  window.gtag = gtag;
                  gtag('js', new Date());
                  gtag('config', gaId, { send_page_view: true });
                } catch (_) {
                  window.dataLayer = window.dataLayer || [];
                  function gtagFallback(){dataLayer.push(arguments);}
                  window.gtag = gtagFallback;
                  gtagFallback('js', new Date());
                  gtagFallback('config', 'G-E33EPY0QV7', { send_page_view: true });
                }
              })();
            `,
          }}
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-E33EPY0QV7"
        />
      </head>
      <body className="bg-[#FAF9F6] text-zinc-900 font-sans antialiased selection:bg-amber-900 selection:text-white">
        <LangProvider>
          {children}
          <PWAInstallBanner />
          <CopyrightCopyHandler />
        </LangProvider>
      </body>
    </html>
  );
}