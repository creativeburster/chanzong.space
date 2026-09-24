import React from 'react';
import type { Metadata } from 'next';
import { getCategories } from '@/lib/categories';
import { CategoriesPageClient } from '@/app/categories/CategoriesPageClient';
import { convertToTrad } from '@/lib/opencc';

export const metadata: Metadata = {
  title: '經藏分類大廳 · 歷代宗門十一大正統門類 | 禪宗知識庫',
  description: '禪宗知識庫十一大標準經藏分類大廳，嚴格遵照《大藏經》宗門部與歷代文獻傳統，系統歸納宗門語錄、印心經藏、達摩根本、叢林清規、公案評唱、傳燈史傳、祖師銘頌、禪修心要、宗義經論、護法論辯、密乘直指等11大正統門類，全景呈現禪門萬千法要。',
  alternates: {
    canonical: '/zh-tw/categories',
    languages: {
      'zh-Hans': '/categories',
      'zh-Hant': '/zh-tw/categories',
    },
  },
  openGraph: {
    type: 'website',
    title: '經藏分類大廳 · 歷代宗門十一大正統門類 | 禪宗知識庫 ChanZong.space',
    description: '嚴格遵照大藏經宗門部傳統，系統歸類167部禪宗經典至宗門語錄、印心經藏、達摩根本、叢林清規、公案評唱等11大正統門類。',
    url: 'https://chanzong.space/zh-tw/categories',
    siteName: '禪宗知識庫',
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary',
    title: '經藏分類大廳 · 歷代宗門十一大正統門類 | 禪宗知識庫',
    description: '嚴格遵照大藏經宗門部傳統，系統歸類167部禪宗經典至11大正統門類。',
  },
};

export default function TradCategoriesPage() {
  const categories = getCategories();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '禪宗經藏分類大廳',
    description: '禪宗知識庫收錄之歷代宗門十一大正統經藏分類總覽',
    url: 'https://chanzong.space/zh-tw/categories',
    inLanguage: 'zh-TW',
    numberOfItems: categories.length,
    itemListElement: categories.map((cat, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'CollectionPage',
        name: convertToTrad(cat.name),
        headline: convertToTrad(cat.subtitle),
        description: convertToTrad(cat.significance),
        url: `https://chanzong.space/zh-tw/categories/${cat.id}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoriesPageClient categories={categories} />
    </>
  );
}
