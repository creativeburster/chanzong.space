import React from 'react';
import type { Metadata } from 'next';
import { getCollections } from '@/lib/collections';
import { CollectionsPageClient } from '@/app/collections/CollectionsPageClient';
import { convertToTrad } from '@/lib/opencc';

export const metadata: Metadata = {
  title: '典籍合集大廳 · 歷代宗門著作專題彙編 | 禪宗知識庫',
  description: '禪宗知識庫典籍合集大廳，系統彙集《少室六門》《傳法正宗三書》《永明延壽一心法界全書》《普照國師修心指南》《圓悟克勤禪法總集》《龍樹中觀根本論典集》等14大宗師經典合集，全方位重現法統源流與修持大廈。',
  alternates: {
    canonical: '/zh-tw/collections',
    languages: {
      'zh-Hans': '/collections',
      'zh-Hant': '/zh-tw/collections',
    },
  },
  openGraph: {
    type: 'website',
    title: '典籍合集大廳 · 歷代宗門著作專題彙編 | 禪宗知識庫 ChanZong.space',
    description: '系統彙集14大宗師經典合集，涵蓋44部核心典籍。重現少室六門、傳法正宗、宗鏡大廈等法脈體系。',
    url: 'https://chanzong.space/zh-tw/collections',
    siteName: '禪宗知識庫',
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary',
    title: '典籍合集大廳 · 歷代宗門著作專題彙編 | 禪宗知識庫',
    description: '系統彙集14大宗師經典合集，涵蓋44部核心典籍。重現少室六門、傳法正宗、宗鏡大廈等法脈體系。',
  },
};

export default function TradCollectionsPage() {
  const collections = getCollections();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '禪宗典籍合集大廳',
    description: '禪宗知識庫收錄之歷代宗師經典合集專題總覽',
    url: 'https://chanzong.space/zh-tw/collections',
    inLanguage: 'zh-TW',
    numberOfItems: collections.length,
    itemListElement: collections.map((col, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'CollectionPage',
        name: convertToTrad(col.title),
        headline: convertToTrad(col.subtitle),
        url: `https://chanzong.space/zh-tw/collections/${col.id}`,
        author: {
          '@type': 'Person',
          name: convertToTrad(col.author),
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CollectionsPageClient collections={collections} />
    </>
  );
}
