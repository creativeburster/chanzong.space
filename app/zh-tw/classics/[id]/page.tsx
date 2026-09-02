import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getClassicById, getManifest } from '@/lib/data';
import { ClassicViewer } from '@/app/classics/[id]/ClassicViewer';
import { marked } from 'marked';
import { ZEN_FAQS } from '@/lib/taxonomy';
import { convertToTrad, convertHtmlToTrad } from '@/lib/opencc';

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

  const titleTrad = convertToTrad(meta.title);
  const authorTrad = convertToTrad(meta.author);
  const catTrad = convertToTrad(meta.category);
  const summaryTrad = convertToTrad(meta.summary || `${meta.title}，${meta.author}著，${meta.category}類經典。`);

  return {
    title: `${titleTrad} · ${authorTrad}`,
    description: `${summaryTrad.slice(0, 100)} 作者：${authorTrad}，約${Math.round(meta.word_count / 1000)}千字。`,
    alternates: {
      canonical: `/zh-tw/classics/${meta.id}`,
      languages: {
        'zh-Hans': `/classics/${meta.id}`,
        'zh-Hant': `/zh-tw/classics/${meta.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${titleTrad} · ${authorTrad} | 禪宗知識庫 ChanZong.space`,
      description: summaryTrad.slice(0, 160),
      url: `https://chanzong.space/zh-tw/classics/${meta.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
      authors: [authorTrad],
    },
    twitter: {
      card: 'summary',
      title: `${titleTrad} · ${authorTrad}`,
      description: summaryTrad.slice(0, 140),
    },
  };
}

export default function TradClassicPage({ params }: PageProps) {
  const { meta, content } = getClassicById(params.id);

  if (!meta) {
    notFound();
  }

  const manifest = getManifest();
  const currentIndex = manifest.findIndex((item) => item.id === meta.id);
  const prevItem = currentIndex > 0 ? manifest[currentIndex - 1] : null;
  const nextItem = currentIndex < manifest.length - 1 ? manifest[currentIndex + 1] : null;

  const rawHtml = marked
    .parse(content || '*正在提取該篇章全文中，請稍候刷新...*', { async: false })
    .replace(/<h1/g, '<h2')
    .replace(/<\/h1>/g, '</h2>');

  const htmlContent = convertHtmlToTrad(rawHtml as string);

  const titleTrad = convertToTrad(meta.title);
  const authorTrad = convertToTrad(meta.author);
  const catTrad = convertToTrad(meta.category);
  const summaryTrad = convertToTrad(meta.summary || `${meta.title}，${meta.author}著，${meta.category}類經典。`);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: titleTrad,
    author: {
      '@type': 'Person',
      name: authorTrad,
    },
    publisher: {
      '@type': 'Organization',
      name: '禪宗知識庫',
      url: 'https://chanzong.space/zh-tw',
    },
    description: summaryTrad.slice(0, 160),
    url: `https://chanzong.space/zh-tw/classics/${meta.id}`,
    inLanguage: 'zh-TW',
    genre: catTrad,
    wordCount: meta.word_count,
    dateModified: new Date().toISOString().split('T')[0],
  };

  const classicFaqs = ZEN_FAQS.filter(f => f.relatedBooks && f.relatedBooks.includes(meta.id)).slice(0, 20);
  const faqPageJsonLd = classicFaqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'zh-TW',
    mainEntity: classicFaqs.map(f => ({
      '@type': 'Question',
      name: convertToTrad(f.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: convertToTrad(f.answer),
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
