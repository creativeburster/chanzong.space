import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCollections, getCollectionById } from '@/lib/collections';
import { CollectionDetailClient } from '@/app/collections/[id]/CollectionDetailClient';
import { ZEN_CONCEPTS, ZEN_PERSONS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

interface PageProps {
  params: {
    id: string;
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  const collections = getCollections();
  return collections.map((col) => ({
    id: col.id,
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const col = getCollectionById(params.id);
  if (!col) return {};

  const titleTrad = convertToTrad(`${col.title} · ${col.subtitle}`);
  const summaryTrad = convertToTrad(col.summary.slice(0, 140));
  const desc = `${summaryTrad} 包含 ${col.books.length} 門根本法門，傳承禪宗宗門精義。`;

  return {
    title: convertToTrad(`${col.title} · ${col.subtitle}`),
    description: desc,
    alternates: {
      canonical: `/zh-tw/collections/${col.id}`,
      languages: {
        'zh-Hans': `/collections/${col.id}`,
        'zh-Hant': `/zh-tw/collections/${col.id}`,
        'x-default': `/collections/${col.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${titleTrad} | 禪宗知識庫 ChanZong.space`,
      description: desc,
      url: `https://chanzong.space/zh-tw/collections/${col.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
      images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禪宗知識庫 ChanZong.space' }],
    },
    twitter: {
      card: 'summary',
      title: titleTrad,
      description: desc,
    },
  };
}

export default function TradCollectionDetailPage({ params }: PageProps) {
  const collection = getCollectionById(params.id);
  if (!collection) {
    notFound();
  }

  const resolvedPersons = collection.relatedPersons.map((pid) => {
    const p = ZEN_PERSONS.find((x) => x.id === pid);
    return { id: pid, name: p ? p.name : pid };
  });
  const resolvedConcepts = collection.relatedConcepts.map((cid) => {
    const c = ZEN_CONCEPTS.find((x) => x.id === cid);
    return { id: cid, title: c ? c.title : cid };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: convertToTrad(collection.title),
    headline: convertToTrad(collection.subtitle),
    description: convertToTrad(collection.summary.slice(0, 160)),
    url: `https://chanzong.space/zh-tw/collections/${collection.id}`,
    inLanguage: 'zh-TW',
    author: {
      '@type': 'Person',
      name: convertToTrad(collection.author),
    },
    hasPart: collection.books.map((b) => ({
      '@type': 'Book',
      name: convertToTrad(b.title),
      url: `https://chanzong.space/zh-tw/classics/${b.classicId}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CollectionDetailClient
        collection={collection}
        resolvedPersons={resolvedPersons}
        resolvedConcepts={resolvedConcepts}
      />
    </>
  );
}
