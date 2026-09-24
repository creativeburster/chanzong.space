import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategories, getCategoryById } from '@/lib/categories';
import { CategoryDetailPageClient } from '@/app/categories/[slug]/CategoryDetailPageClient';
import { convertToTrad } from '@/lib/opencc';
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

  const titleTrad = convertToTrad(`${cat.name} · ${cat.subtitle} | 經藏分類`);
  const descTrad = convertToTrad(
    `${cat.significance} 禪宗知識庫精選收錄 ${cat.classicIds.length} 部典籍，涵蓋歷代宗匠法語與核心修持要義。`
  );

  return {
    title: titleTrad,
    description: descTrad,
    alternates: {
      canonical: `/zh-tw/categories/${cat.id}`,
      languages: {
        'zh-Hans': `/categories/${cat.id}`,
        'zh-Hant': `/zh-tw/categories/${cat.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${titleTrad} | 禪宗知識庫 ChanZong.space`,
      description: descTrad,
      url: `https://chanzong.space/zh-tw/categories/${cat.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
    },
    twitter: {
      card: 'summary',
      title: titleTrad,
      description: descTrad,
    },
  };
}

export default function TradCategoryDetailPage({ params }: PageProps) {
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
    name: convertToTrad(category.name),
    headline: convertToTrad(category.subtitle),
    description: convertToTrad(category.description.slice(0, 160)),
    url: `https://chanzong.space/zh-tw/categories/${category.id}`,
    inLanguage: 'zh-TW',
    numberOfItems: books.length,
    hasPart: books.map((b) => ({
      '@type': 'Book',
      name: convertToTrad(b.title),
      author: {
        '@type': 'Person',
        name: convertToTrad(b.author),
      },
      url: `https://chanzong.space/zh-tw/classics/${b.id}`,
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
