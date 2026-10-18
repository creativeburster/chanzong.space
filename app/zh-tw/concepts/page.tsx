import type { Metadata } from 'next';
import ConceptsPageClient from '@/app/concepts/ConceptsPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_CONCEPTS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

export const metadata: Metadata = {
  title: '核心概念',
  description: `禪宗${STATS.concepts}個核心概念詳解——佛性、般若、空、不二、頓悟、見性、平常心是道等，涵蓋心性、境界、修證、教理四大類，附祖師金句與參修指導。`,
  alternates: {
    canonical: '/zh-tw/concepts',
    languages: {
      'zh-Hans': '/concepts',
      'zh-Hant': '/zh-tw/concepts',
      'x-default': '/concepts',
    },
  },
  openGraph: {
    type: 'website',
    title: '核心概念 | 禪宗知識庫 ChanZong.space',
    description: `禪宗${STATS.concepts}個核心概念詳解，涵蓋心性、境界、修證、教理四大類。`,
    url: 'https://chanzong.space/zh-tw/concepts',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradConceptsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/zh-tw/concepts#collection',
    name: '禪宗核心概念庫',
    description: `禪宗${STATS.concepts}個核心概念詳解——涵蓋心性、境界、修證、教理四大類。`,
    url: 'https://chanzong.space/zh-tw/concepts',
    inLanguage: 'zh-TW',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ZEN_CONCEPTS.length,
      itemListElement: ZEN_CONCEPTS.slice(0, 50).map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: convertToTrad(c.title),
        url: `https://chanzong.space/zh-tw/concepts/${c.id}`,
      })),
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ConceptsPageClient />
    </>
  );
}
