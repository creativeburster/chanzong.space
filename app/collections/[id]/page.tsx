import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCollections, getCollectionById } from '@/lib/collections';
import { CollectionDetailClient } from './CollectionDetailClient';
import { ZEN_CONCEPTS, ZEN_PERSONS } from '@/lib/taxonomy';

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

  const title = `${col.title} · ${col.subtitle}`;
  const desc = `${col.summary.slice(0, 140)} 包含 ${col.books.length} 门根本法门，传承禅宗宗门精义。`;

  return {
    title: `${col.title} · ${col.subtitle}`,
    description: desc,
    alternates: {
      canonical: `/collections/${col.id}`,
      languages: {
        'zh-Hans': `/collections/${col.id}`,
        'zh-Hant': `/zh-tw/collections/${col.id}`,
        'x-default': `/collections/${col.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${col.title} · ${col.subtitle} | 禅宗知识库 ChanZong.space`,
      description: desc,
      url: `https://chanzong.space/collections/${col.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
      images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禅宗知识库 ChanZong.space' }],
    },
    twitter: {
      card: 'summary',
      title: `${col.title} · ${col.subtitle}`,
      description: desc,
    },
  };
}

export default function CollectionDetailPage({ params }: PageProps) {
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
    name: collection.title,
    headline: collection.subtitle,
    description: collection.summary.slice(0, 160),
    url: `https://chanzong.space/collections/${collection.id}`,
    inLanguage: 'zh-CN',
    author: {
      '@type': 'Person',
      name: collection.author,
    },
    hasPart: collection.books.map((b) => ({
      '@type': 'Book',
      name: b.title,
      url: `https://chanzong.space/classics/${b.classicId}`,
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
