import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getClassicById, getManifest } from '@/lib/data';
import { ClassicViewer } from './ClassicViewer';
import { marked } from 'marked';
import { ZEN_FAQS } from '@/lib/taxonomy';

interface PageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  const manifest = getManifest();
  return manifest.map((item) => ({
    id: item.id,
  }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const { meta } = getClassicById(params.id);
  if (!meta) return {};

  const summary = meta.summary || `${meta.title}，${meta.author}著，${meta.category}类经典。`;

  return {
    title: `${meta.title} · ${meta.author}`,
    description: `${summary.slice(0, 100)} 作者：${meta.author}，约${Math.round(meta.word_count / 1000)}千字。`,
    alternates: {
      canonical: `/classics/${meta.id}`,
      languages: {
        'zh-Hans': `/classics/${meta.id}`,
        'zh-Hant': `/zh-tw/classics/${meta.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${meta.title} · ${meta.author} | 禅宗知识库 ChanZong.space`,
      description: summary.slice(0, 160),
      url: `https://chanzong.space/classics/${meta.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
      authors: [meta.author],
    },
    twitter: {
      card: 'summary',
      title: `${meta.title} · ${meta.author}`,
      description: summary.slice(0, 140),
    },
    other: {
      'article:author': meta.author,
      'article:section': meta.category,
    },
  };
}

export default function ClassicPage({ params }: PageProps) {
  const { meta, content } = getClassicById(params.id);

  if (!meta) {
    notFound();
  }

  const manifest = getManifest();
  const currentIndex = manifest.findIndex((item) => item.id === meta.id);
  const prevItem = currentIndex > 0 ? manifest[currentIndex - 1] : null;
  const nextItem = currentIndex < manifest.length - 1 ? manifest[currentIndex + 1] : null;

  const htmlContent = marked
    .parse(content || '*正在提取该篇章全文中，请稍候刷新...*', { async: false })
    .replace(/<h1/g, '<h2')
    .replace(/<\/h1>/g, '</h2>');

  const articleSummary = meta.summary || `${meta.title}，${meta.author}著，${meta.category}类经典。`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    author: {
      '@type': 'Person',
      name: meta.author,
    },
    publisher: {
      '@type': 'Organization',
      name: '禅宗知识库',
      url: 'https://chanzong.space',
    },
    description: articleSummary.slice(0, 160),
    url: `https://chanzong.space/classics/${meta.id}`,
    inLanguage: 'zh-CN',
    genre: meta.category,
    wordCount: meta.word_count,
    dateModified: new Date().toISOString().split('T')[0],
  };

  // FAQPage schema for this classic's FAQs
  const classicFaqs = ZEN_FAQS.filter(f => f.relatedBooks && f.relatedBooks.includes(meta.id)).slice(0, 20);
  const faqPageJsonLd = classicFaqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: classicFaqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqPageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
        />
      )}
      <ClassicViewer
        meta={meta}
        htmlContent={htmlContent}
        rawContent={content}
        manifest={manifest}
        prevItem={prevItem}
        nextItem={nextItem}
      />
    </>
  );
}
