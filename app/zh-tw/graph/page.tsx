import type { Metadata } from 'next';
import GraphClient from '@/app/graph/GraphClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '知識圖譜 · 經典概念祖師公案全景網絡',
  description: `禪宗交互式知識圖譜——${STATS.concepts}個核心概念、${STATS.classics}部經典著作、${STATS.persons}位歷代祖師、${STATS.koans}則公案與${STATS.methods}種法門的拓撲關聯全景圖，交互式探索禪宗法脈與知識關聯。`,
  alternates: {
    canonical: '/zh-tw/graph',
    languages: {
      'zh-Hans': '/graph',
      'zh-Hant': '/zh-tw/graph',
      'x-default': '/graph',
    },
  },
  openGraph: {
    type: 'website',
    title: '知識圖譜 | 禪宗知識庫 ChanZong.space',
    description: `${STATS.concepts}個概念、${STATS.classics}部著作、${STATS.persons}位祖師、${STATS.koans}則公案的關聯全景圖。`,
    url: 'https://chanzong.space/zh-tw/graph',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禪宗知識庫 ChanZong.space' }],
  },
};

export default function TradGraphPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': 'https://chanzong.space/zh-tw/graph#dataset',
    name: '禪宗知識庫多維實體拓撲圖譜 (ChanZong Knowledge Graph)',
    description: `涵蓋${STATS.classics}部禪宗原典、${STATS.concepts}個核心概念、${STATS.koans}則禪門公案、${STATS.persons}位歷代祖師與${STATS.methods}種修持法門的雙向交叉關聯知識網絡數據集。`,
    url: 'https://chanzong.space/zh-tw/graph',
    inLanguage: 'zh-TW',
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    creator: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禪宗知識庫',
      url: 'https://chanzong.space/zh-tw',
    },
    keywords: ['禪宗知識圖譜', '佛教文獻圖譜', 'CBETA', '禪宗公案', '五家七宗', 'D3.js 知識網絡'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GraphClient />
    </>
  );
}
