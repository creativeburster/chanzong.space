import type { Metadata } from 'next';
import PersonsPageClient from '@/app/persons/PersonsPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_PERSONS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

export const metadata: Metadata = {
  title: '禪門人物',
  description: `禪宗${STATS.persons}位禪門人物——從菩提達摩、六祖惠能到馬祖道一、臨濟義玄、趙州從諗，禪師傳記、悟道因緣與教學風格。`,
  alternates: {
    canonical: '/zh-tw/persons',
    languages: {
      'zh-Hans': '/persons',
      'zh-Hant': '/zh-tw/persons',
      'x-default': '/persons',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪門人物 | 禪宗知識庫 ChanZong.space',
    description: `禪宗${STATS.persons}位禪門人物傳記、悟道因緣與教學風格。`,
    url: 'https://chanzong.space/zh-tw/persons',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
    images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禪宗知識庫 ChanZong.space' }],
  },
};

export default function TradPersonsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/zh-tw/persons#collection',
    name: '禪門歷代祖師與人物誌',
    description: `禪宗${STATS.persons}位禪門人物傳記、悟道因緣與教學風格。`,
    url: 'https://chanzong.space/zh-tw/persons',
    inLanguage: 'zh-TW',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ZEN_PERSONS.length,
      itemListElement: ZEN_PERSONS.slice(0, 50).map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: convertToTrad(p.name),
        url: `https://chanzong.space/zh-tw/persons/${p.id}`,
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
