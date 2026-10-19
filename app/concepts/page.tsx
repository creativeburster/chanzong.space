import type { Metadata } from 'next';
import ConceptsPageClient from './ConceptsPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_CONCEPTS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: '核心概念',
  description: `禅宗${STATS.concepts}个核心概念详解——佛性、般若、空、不二、顿悟、见性、平常心是道等，涵盖心性、境界、修证、教理四大类，附祖师金句与参修指导。`,
  alternates: {
    canonical: '/concepts',
    languages: {
      'zh-Hans': '/concepts',
      'zh-Hant': '/zh-tw/concepts',
      'x-default': '/concepts',
    },
  },
  openGraph: {
    type: 'website',
    title: '核心概念 | 禅宗知识库 ChanZong.space',
    description: `禅宗${STATS.concepts}个核心概念详解，涵盖心性、境界、修证、教理四大类。`,
    url: 'https://chanzong.space/concepts',
    images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禅宗知识库 ChanZong.space' }],
  },
};

export default function ConceptsPagePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/concepts#collection',
    name: '禅宗核心概念库',
    description: `禅宗${STATS.concepts}个核心概念详解——涵盖心性、境界、修证、教理四大类。`,
    url: 'https://chanzong.space/concepts',
    inLanguage: 'zh-CN',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ZEN_CONCEPTS.length,
      itemListElement: ZEN_CONCEPTS.slice(0, 50).map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: c.title,
        url: `https://chanzong.space/concepts/${c.id}`,
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
