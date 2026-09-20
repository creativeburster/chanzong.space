import React from 'react';
import type { Metadata } from 'next';
import { LangProvider } from '@/context/LangContext';
import { STATS } from '@/lib/stats';

const SITE_URL = 'https://chanzong.space';

export const metadata: Metadata = {
  title: {
    default: '禪宗知識庫 | 頓悟見性之道 | ChanZong.space',
    template: '%s | 禪宗知識庫 ChanZong.space',
  },
  description: `禪宗知識庫（chanzong.space）——收錄${STATS.classics}部核心禪宗典籍，含${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種修持法門、${STATS.faqs}條問答。從達摩四論、六祖壇經到無門關、碧巖錄，傳承頓悟見性之道。`,
  keywords: ['禪宗', '禪宗知識庫', '六祖壇經', '達摩四論', '黃檗傳心法要', '無門關', '碧巖錄', '禪關策進', '大乘起信論', '公案', '禪宗典籍', 'ChanZong', 'Zen Buddhism', '見性成佛', '頓悟', '止觀', '看話頭', '參禪', '禪修', '祖師語錄'],
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
    title: '禪宗知識庫 | 頓悟見性之道 | ChanZong.space',
    description: `收錄${STATS.classics}部禪宗核心典籍，含${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門、${STATS.faqs}條問答。傳承頓悟見性之道。`,
    url: `${SITE_URL}/zh-tw`,
    images: [
      {
        url: '/logo-nianhua-new.jpg',
        width: 512,
        height: 512,
        alt: '禪宗知識庫',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '禪宗知識庫 | 頓悟見性之道 | ChanZong.space',
    description: `收錄${STATS.classics}部禪宗核心典籍，含${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門。`,
    images: ['/logo-nianhua-new.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '禪宗知識庫',
  },
};

export default function TradLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '禪宗知識庫',
    alternateName: 'ChanZong.space',
    url: `${SITE_URL}/zh-tw`,
    description: `收錄${STATS.classics}部禪宗核心典籍，含${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門、${STATS.faqs}條問答。傳承頓悟見性之道。`,
    inLanguage: 'zh-TW',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/zh-tw/books?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <LangProvider initialTraditional={true}>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{document.documentElement.lang='zh-TW';}catch(e){}})();`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </LangProvider>
  );
}
