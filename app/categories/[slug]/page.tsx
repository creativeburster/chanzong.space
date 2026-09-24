import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategories, getCategoryById } from '@/lib/categories';
import { CategoryDetailPageClient } from './CategoryDetailPageClient';
import manifest from '@/manifest.json';

interface PageProps {
  params: {
    slug: string;
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  const categories = getCategories();
  return categories.map((cat) => ({
    slug: cat.id,
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const cat = getCategoryById(params.slug);
  if (!cat) return {};

  const title = `${cat.name} · ${cat.subtitle} | 经藏分类`;
  const desc = `${cat.significance} 禅宗知识库精选收录 ${cat.classicIds.length} 部典籍，涵盖历代宗匠法语与核心修持要义。`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `/categories/${cat.id}`,
      languages: {
        'zh-Hans': `/categories/${cat.id}`,
        'zh-Hant': `/zh-tw/categories/${cat.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${cat.name} · ${cat.subtitle} | 禅宗知识库 ChanZong.space`,
      description: desc,
      url: `https://chanzong.space/categories/${cat.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
    },
    twitter: {
      card: 'summary',
      title: `${cat.name} · ${cat.subtitle}`,
      description: desc,
    },
  };
}

export default function CategoryDetailPage({ params }: PageProps) {
  const category = getCategoryById(params.slug);
  if (!category) {
    notFound();
  }

  const allCategories = getCategories();

  // 获取该分类下的典籍对象
  const manifestMap = new Map(manifest.map((m) => [m.id, m]));
  const books = category.classicIds
    .map((cid) => manifestMap.get(cid))
    .filter((b): b is typeof manifest[0] => Boolean(b));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    headline: category.subtitle,
    description: category.description.slice(0, 160),
    url: `https://chanzong.space/categories/${category.id}`,
    inLanguage: 'zh-CN',
    numberOfItems: books.length,
    hasPart: books.map((b) => ({
      '@type': 'Book',
      name: b.title,
      author: {
        '@type': 'Person',
        name: b.author,
      },
      url: `https://chanzong.space/classics/${b.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryDetailPageClient category={category} allCategories={allCategories} />
    </>
  );
}
