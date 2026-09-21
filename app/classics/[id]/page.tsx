import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getClassicById, getManifest } from '@/lib/data';
import { ClassicViewer } from './ClassicViewer';
import { marked } from 'marked';
import { ZEN_FAQS, ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';
import { ZEN_GLOSSARY } from '@/lib/glossary';
import { ZEN_TRANSLATIONS } from '@/lib/translations';
import { injectGlossaryMarkups } from '@/lib/glossaryMarkup';
import { splitClassicVolumes } from '@/lib/splitVolumes';
import { extractCards, extractAudioText, extractOriginalParagraphs, extractGuidesAndQuotes } from '@/lib/extractCards';

interface PageProps {
  params: {
    id: string;
  };
}

export const dynamicParams = false;

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

  const rawText = content || '*正在提取该篇章全文中，请稍候刷新...*';
  const htmlContent = marked
    .parse(rawText, { async: false })
    .replace(/<h1/g, '<h2')
    .replace(/<\/h1>/g, '</h2>') as string;

  // 服务端提取轻量结构化卡片与辅助信息（仅数 KB，杜绝客户端序列化全书大字符串）
  const extracted = extractCards(rawText);
  const audioText = extractAudioText(rawText);
  const originalParagraphs = extractOriginalParagraphs(rawText).slice(0, 50);
  const summaryInfo = extractGuidesAndQuotes(rawText);

  // 服务端预先注入生僻字注音，并在服务端生成正文 JSX 作为 children 传入
  const classicGlossary = ZEN_GLOSSARY[meta.id] || [];
  const parsedVolumes = splitClassicVolumes(htmlContent);

  let volumesMeta: { index: number; title: string }[] | undefined = undefined;
  let guideHtml: string | undefined = undefined;
  let children: React.ReactNode = null;

  if (parsedVolumes.isMultiVolume) {
    volumesMeta = parsedVolumes.volumes.map(v => ({ index: v.index, title: v.title }));
    guideHtml = injectGlossaryMarkups(parsedVolumes.guideHtml, classicGlossary, true);
    children = (
      <div className="volume-articles-container">
        {parsedVolumes.volumes.map((v) => {
          const vHtml = injectGlossaryMarkups(v.html, classicGlossary, true);
          return (
            <div
              key={v.index}
              id={`volume-${v.index}`}
              data-volume-idx={v.index}
              className="volume-section"
              dangerouslySetInnerHTML={{ __html: vHtml }}
            />
          );
        })}
      </div>
    );
  } else {
    const renderedHtml = injectGlossaryMarkups(htmlContent, classicGlossary, true);
    children = <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
  }

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

  // 服务端预先查找本经典关联的实体（避免客户端组件全量打包 3.8MB taxonomy）
  const relPersons = ZEN_PERSONS.filter((p) => p.relatedBooks.includes(meta.id));
  const relConcepts = ZEN_CONCEPTS.filter((c) => c.relatedBooks.includes(meta.id));
  const relMethods = ZEN_METHODS.filter((m) => m.relatedBooks.includes(meta.id));
  const relQas = ZEN_KOANS.filter((q) => q.relatedBooks.includes(meta.id));
  const relFaqs = ZEN_FAQS.filter((f) => f.relatedBooks && f.relatedBooks.includes(meta.id));

  // FAQPage schema for this classic's FAQs
  const classicFaqs = relFaqs.slice(0, 20);
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

  const classicTranslations = ZEN_TRANSLATIONS[params.id] || [];
  const classicGlossaries = ZEN_GLOSSARY[params.id] || [];

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
        manifest={manifest}
        prevItem={prevItem}
        nextItem={nextItem}
        extracted={extracted}
        audioText={audioText}
        originalParagraphs={originalParagraphs}
        summaryInfo={summaryInfo}
        volumesMeta={volumesMeta}
        guideHtml={guideHtml}
        relPersons={relPersons}
        relConcepts={relConcepts}
        relMethods={relMethods}
        relQas={relQas}
        relFaqs={relFaqs}
        translations={classicTranslations}
        glossaries={classicGlossaries}
      >
        {children}
      </ClassicViewer>
    </>
  );
}
