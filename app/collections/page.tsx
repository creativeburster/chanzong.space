import React from 'react';
import type { Metadata } from 'next';
import { getCollections } from '@/lib/collections';
import { CollectionsPageClient } from './CollectionsPageClient';

export const metadata: Metadata = {
  title: '典籍合集大厅 · 历代宗门著作专题汇编 | 禅宗知识库',
  description: '禅宗知识库典籍合集大厅，系统汇集《少室六门》《传法正宗三书》《永明延寿一心法界全书》《普照国师修心指南》《圆悟克勤禅法总集》《龙树中观根本论典集》等14大宗师经典合集，全方位重现法统源流与修持大厦。',
  alternates: {
    canonical: '/collections',
    languages: {
      'zh-Hans': '/collections',
      'zh-Hant': '/zh-tw/collections',
    },
  },
  openGraph: {
    type: 'website',
    title: '典籍合集大厅 · 历代宗门著作专题汇编 | 禅宗知识库 ChanZong.space',
    description: '系统汇集14大宗师经典合集，涵盖44部核心典籍。重现少室六门、传法正宗、宗镜大厦等法脉体系。',
    url: 'https://chanzong.space/collections',
    siteName: '禅宗知识库',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary',
    title: '典籍合集大厅 · 历代宗门著作专题汇编 | 禅宗知识库',
    description: '系统汇集14大宗师经典合集，涵盖44部核心典籍。重现少室六门、传法正宗、宗镜大厦等法脉体系。',
  },
};

export default function CollectionsPage() {
  const collections = getCollections();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '禅宗典籍合集大厅',
    description: '禅宗知识库收录之历代宗师经典合集专题总览',
    url: 'https://chanzong.space/collections',
    inLanguage: 'zh-CN',
    numberOfItems: collections.length,
    itemListElement: collections.map((col, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'CollectionPage',
        name: col.title,
        headline: col.subtitle,
        url: `https://chanzong.space/collections/${col.id}`,
        author: {
          '@type': 'Person',
          name: col.author,
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
