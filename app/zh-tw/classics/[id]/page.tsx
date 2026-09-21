import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getClassicById, getManifest } from '@/lib/data';
import { ClassicViewer } from '@/app/classics/[id]/ClassicViewer';
import { marked } from 'marked';
import { ZEN_FAQS, ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';
import { convertToTrad, convertHtmlToTrad } from '@/lib/opencc';
import { ZEN_GLOSSARY } from '@/lib/glossary';
import { injectGlossaryMarkups } from '@/lib/glossaryMarkup';
import { splitClassicVolumes } from '@/lib/splitVolumes';
import { ExtractedCards, extractCards, extractAudioText, extractOriginalParagraphs, extractGuidesAndQuotes } from '@/lib/extractCards';

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

  const rawText = content || '*正在提取該篇章全文中，請稍候刷新...*';
  const rawHtml = marked
    .parse(rawText, { async: false })
    .replace(/<h1/g, '<h2')
    .replace(/<\/h1>/g, '</h2>') as string;

  // 服务端提取轻量结构化卡片并繁体化（仅数 KB，杜绝客户端序列化全书大字符串）
  const extracted = extractCards(rawText);
  const tradExtracted: ExtractedCards = {
    verses: extracted.verses.map(v => convertToTrad(v)),
    koans: extracted.koans.map(k => ({ question: convertToTrad(k.question), answer: convertToTrad(k.answer) })),
    practices: extracted.practices.map(p => convertToTrad(p)),
    modernApp: extracted.modernApp.map(m => convertToTrad(m)),
    keyQuotes: extracted.keyQuotes.map(q => convertToTrad(q)),
  };

  const audioText = convertToTrad(extractAudioText(rawText));
  const originalParagraphs = extractOriginalParagraphs(rawText).slice(0, 50).map(p => convertToTrad(p));
  const rawSummary = extractGuidesAndQuotes(rawText);
  const summaryInfo = {
    guide: convertToTrad(rawSummary.guide),
    quotes: convertToTrad(rawSummary.quotes),
    gist: convertToTrad(rawSummary.gist),
  };

  // 服务端预先注入生僻字注音并繁体化，直接生成正文 JSX 节点作为 children 传入
  const classicGlossary = ZEN_GLOSSARY[meta.id] || [];
  const parsedVolumes = splitClassicVolumes(rawHtml);

  let volumesMeta: { index: number; title: string }[] | undefined = undefined;
  let guideHtml: string | undefined = undefined;
  let children: React.ReactNode = null;

  if (parsedVolumes.isMultiVolume) {
    volumesMeta = parsedVolumes.volumes.map(v => ({ index: v.index, title: convertToTrad(v.title) }));
    const markedGuide = injectGlossaryMarkups(parsedVolumes.guideHtml, classicGlossary, true);
    guideHtml = convertHtmlToTrad(markedGuide);

    children = (
      <div className="volume-articles-container">
        {parsedVolumes.volumes.map((v) => {
          const markedVHtml = injectGlossaryMarkups(v.html, classicGlossary, true);
          const tradVHtml = convertHtmlToTrad(markedVHtml);
          return (
            <div
              key={v.index}
              id={`volume-${v.index}`}
              data-volume-idx={v.index}
              className="volume-section"
              dangerouslySetInnerHTML={{ __html: tradVHtml }}
            />
          );
        })}
      </div>
    );
  } else {
    const markedHtml = injectGlossaryMarkups(rawHtml, classicGlossary, true);
    const tradHtml = convertHtmlToTrad(markedHtml);
    children = <div dangerouslySetInnerHTML={{ __html: tradHtml }} />;
  }

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

  // 服务端预先查找本经典关联的实体（避免客户端组件全量打包 3.8MB taxonomy）
  const relPersons = ZEN_PERSONS.filter((p) => p.relatedBooks.includes(meta.id)).map(p => ({
    ...p,
    name: convertToTrad(p.name),
    title: convertToTrad(p.title),
  }));
  const relConcepts = ZEN_CONCEPTS.filter((c) => c.relatedBooks.includes(meta.id)).map(c => ({
    ...c,
    title: convertToTrad(c.title),
    summary: convertToTrad(c.summary || ''),
  }));
  const relMethods = ZEN_METHODS.filter((m) => m.relatedBooks.includes(meta.id)).map(m => ({
    ...m,
    title: convertToTrad(m.title),
    summary: convertToTrad(m.summary || ''),
  }));
  const relQas = ZEN_KOANS.filter((q) => q.relatedBooks.includes(meta.id)).map(q => ({
    ...q,
    question: convertToTrad(q.question),
    answer: convertToTrad(q.answer || ''),
  }));
  const relFaqs = ZEN_FAQS.filter((f) => f.relatedBooks && f.relatedBooks.includes(meta.id)).map(f => ({
    ...f,
    question: convertToTrad(f.question),
    answer: convertToTrad(f.answer || ''),
  }));

  const classicFaqs = relFaqs.slice(0, 20);
  const faqPageJsonLd = classicFaqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'zh-TW',
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
        manifest={manifest}
        prevItem={prevItem}
        nextItem={nextItem}
        extracted={tradExtracted}
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
      >
        {children}
      </ClassicViewer>
    </>
  );
}
