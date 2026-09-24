import React from 'react';
import type { Metadata } from 'next';
import { getCategories } from '@/lib/categories';
import { CategoriesPageClient } from './CategoriesPageClient';

export const metadata: Metadata = {
  title: '经藏分类大厅 · 历代宗门十一大正统门类 | 禅宗知识库',
  description: '禅宗知识库十一大标准经藏分类大厅，严格遵照《大藏经》宗门部与历代文献传统，系统归纳宗门语录、印心经藏、达摩根本、丛林清规、公案评唱、传灯史传、祖师铭颂、禅修心要、宗义经论、护法论辩、密乘直指等11大正统门类，全景呈现禅门万千法要。',
  alternates: {
    canonical: '/categories',
    languages: {
      'zh-Hans': '/categories',
      'zh-Hant': '/zh-tw/categories',
    },
  },
  openGraph: {
    type: 'website',
    title: '经藏分类大厅 · 历代宗门十一大正统门类 | 禅宗知识库 ChanZong.space',
    description: '严格遵照大藏经宗门部传统，系统归类167部禅宗经典至宗门语录、印心经藏、达摩根本、丛林清规、公案评唱等11大正统门类。',
    url: 'https://chanzong.space/categories',
    siteName: '禅宗知识库',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary',
    title: '经藏分类大厅 · 历代宗门十一大正统门类 | 禅宗知识库',
    description: '严格遵照大藏经宗门部传统，系统归类167部禅宗经典至11大正统门类。',
  },
};

export default function CategoriesPage() {
  const categories = getCategories();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: '禅宗经藏分类大厅',
    description: '禅宗知识库收录之历代宗门十一大正统经藏分类总览',
    url: 'https://chanzong.space/categories',
    inLanguage: 'zh-CN',
    numberOfItems: categories.length,
    itemListElement: categories.map((cat, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'CollectionPage',
        name: cat.name,
        headline: cat.subtitle,
        description: cat.significance,
        url: `https://chanzong.space/categories/${cat.id}`,
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
