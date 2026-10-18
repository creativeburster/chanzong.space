import type { Metadata } from 'next';
import MethodsPageClient from './MethodsPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_METHODS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: "禅宗修行法门 · 历代修持宗纲",
  description: `禅宗${STATS.methods}种修持法门——念佛禅、棒喝、机锋、看话头、默照禅、坐禅仪等，禅门实修方便与用功方法详解。`,
  alternates: {
    canonical: '/methods',
    languages: {
      'zh-Hans': '/methods',
      'zh-Hant': '/zh-tw/methods',
      'x-default': '/methods',
    },
  },
  openGraph: {
    type: 'website',
    title: '修持法门 | 禅宗知识库 ChanZong.space',
    description: `禅宗${STATS.methods}种修持法门——禅门实修方便与用功方法详解。`,
    url: 'https://chanzong.space/methods',
  },
};

export default function MethodsPagePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/methods#collection',
    name: '禅宗修持法门库',
    description: `禅宗${STATS.methods}种修持法门——禅门实修方便与用功方法详解。`,
    url: 'https://chanzong.space/methods',
    inLanguage: 'zh-CN',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ZEN_METHODS.length,
      itemListElement: ZEN_METHODS.slice(0, 50).map((m, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: m.title,
        url: `https://chanzong.space/methods/${m.id}`,
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
