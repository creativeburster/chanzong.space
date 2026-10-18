import type { Metadata } from 'next';
import MethodsPageClient from '@/app/methods/MethodsPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_METHODS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

export const metadata: Metadata = {
  title: "禪宗修行法門 · 歷代修持宗綱",
  description: `禪宗${STATS.methods}種修持法門——念佛禪、棒喝、機鋒、看話頭、默照禪、坐禪儀等，禪門實修方便與用功方法詳解。`,
  alternates: {
    canonical: '/zh-tw/methods',
    languages: {
      'zh-Hans': '/methods',
      'zh-Hant': '/zh-tw/methods',
      'x-default': '/methods',
    },
  },
  openGraph: {
    type: 'website',
    title: '修持法門 | 禪宗知識庫 ChanZong.space',
    description: `禪宗${STATS.methods}種修持法門——禪門實修方便與用功方法詳解。`,
    url: 'https://chanzong.space/zh-tw/methods',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradMethodsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/zh-tw/methods#collection',
    name: '禪宗修持法門庫',
    description: `禪宗${STATS.methods}種修持法門——禪門實修方便與用功方法詳解。`,
    url: 'https://chanzong.space/zh-tw/methods',
    inLanguage: 'zh-TW',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ZEN_METHODS.length,
      itemListElement: ZEN_METHODS.slice(0, 50).map((m, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: convertToTrad(m.title),
        url: `https://chanzong.space/zh-tw/methods/${m.id}`,
      })),
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MethodsPageClient />
    </>
  );
}
