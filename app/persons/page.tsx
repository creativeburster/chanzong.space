import type { Metadata } from 'next';
import PersonsPageClient from './PersonsPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_PERSONS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: '禅门人物',
  description: `禅宗${STATS.persons}位禅门人物——从菩提达摩、六祖惠能到马祖道一、临济义玄、赵州从谂，禅师传记、悟道因缘与教学风格。`,
  alternates: {
    canonical: '/persons',
    languages: {
      'zh-Hans': '/persons',
      'zh-Hant': '/zh-tw/persons',
      'x-default': '/persons',
    },
  },
  openGraph: {
    type: 'website',
    title: '禅门人物 | 禅宗知识库 ChanZong.space',
    description: `禅宗${STATS.persons}位禅门人物传记、悟道因缘与教学风格。`,
    url: 'https://chanzong.space/persons',
  },
};

export default function PersonsPagePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/persons#collection',
    name: '禅门历代祖师与人物志',
    description: `禅宗${STATS.persons}位禅门人物传记、悟道因缘与教学风格。`,
    url: 'https://chanzong.space/persons',
    inLanguage: 'zh-CN',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ZEN_PERSONS.length,
      itemListElement: ZEN_PERSONS.slice(0, 50).map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: p.name,
        url: `https://chanzong.space/persons/${p.id}`,
      })),
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PersonsPageClient />
    </>
  );
}
