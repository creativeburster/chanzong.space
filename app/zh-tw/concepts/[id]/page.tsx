import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ConceptDetailPageClient from '@/app/concepts/[id]/ConceptDetailPageClient';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

interface PageProps { params: { id: string } }

export const dynamicParams = false;

function EntityJsonLd({ item }: { item: any }) {
  const name = convertToTrad(String(item.title || ''));
  const desc = convertToTrad(String(item.summary || '')).replace(/\s+/g, ' ').slice(0, 160);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `https://chanzong.space/zh-tw/concepts/${item.id}#term`,
    name,
    description: desc,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: convertToTrad('禅宗核心心性与修持概念库'),
      url: 'https://chanzong.space/zh-tw/concepts',
    },
    termCode: item.id,
    url: `https://chanzong.space/zh-tw/concepts/${item.id}`,
    inLanguage: 'zh-TW',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'main p'],
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function generateStaticParams() {
  return ZEN_CONCEPTS.map((x: any) => ({ id: x.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = ZEN_CONCEPTS.find((x: any) => x.id === params.id);
  if (!item) return {};
  const name = convertToTrad(String(item.title || params.id));
  const desc = convertToTrad(String(item.summary || '')).replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 概念`;
  return {
    title,
    description: desc || '概念條目',
    alternates: {
      canonical: `/zh-tw/concepts/${params.id}`,
      languages: {
        'zh-Hans': `/concepts/${params.id}`,
        'zh-Hant': `/zh-tw/concepts/${params.id}`,
        'x-default': `/concepts/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 概念 | 禪宗知識庫 ChanZong.space`,
      description: desc.slice(0, 150) || '概念條目',
      url: `https://chanzong.space/zh-tw/concepts/${params.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
    },
  };
}

export default function TradConceptDetailPage({ params }: PageProps) {
  const item = ZEN_CONCEPTS.find((x: any) => x.id === params.id);
  if (!item) {
    notFound();
  }

  const tradItem = {
    ...item,
    title: convertToTrad(item.title),
    category: convertToTrad(item.category || ''),
    summary: convertToTrad(item.summary || ''),
    etymology: item.etymology ? convertToTrad(item.etymology) : item.etymology,
    guidance: item.guidance ? convertToTrad(item.guidance) : item.guidance,
    quotes: Array.isArray(item.quotes) ? item.quotes.map((q: string) => convertToTrad(q)) : item.quotes,
  };

  // 1. 同一范畴的其他概念
  const sameCategoryConcepts = item.category
    ? ZEN_CONCEPTS.filter((c: any) => c.id !== item.id && c.category === item.category).slice(0, 6).map((c: any) => ({
        ...c,
        title: convertToTrad(c.title),
        summary: convertToTrad(c.summary || ''),
        category: convertToTrad(c.category || ''),
      }))
    : [];

  // 2. 阐发此概念的代表公案
  const explicitKoans = ZEN_KOANS.filter((q: any) => q.relatedConcepts && q.relatedConcepts.includes(item.id));
  let relatedKoans = explicitKoans;
  if (explicitKoans.length < 6) {
    const explicitIds = new Set(explicitKoans.map((q: any) => q.id));
    const implicitKoans = ZEN_KOANS.filter((q: any) => {
      if (explicitIds.has(q.id)) return false;
      return (
        q.question.includes(item.title) ||
        q.answer.includes(item.title) ||
        (q.interpretation && q.interpretation.includes(item.title))
      );
    });
    relatedKoans = [...explicitKoans, ...implicitKoans].slice(0, 6);
  } else {
    relatedKoans = explicitKoans.slice(0, 6);
  }
  const tradRelatedKoans = relatedKoans.map((q: any) => ({
    ...q,
    question: convertToTrad(q.question),
    answer: convertToTrad(q.answer),
    master: q.master ? convertToTrad(q.master) : q.master,
  }));

  // 3. 践行此概念的实修法门
  const explicitMethods = ZEN_METHODS.filter((m: any) => m.relatedConcepts && m.relatedConcepts.includes(item.id));
  let relatedMethods = explicitMethods;
  if (explicitMethods.length < 4) {
    const explicitIds = new Set(explicitMethods.map((m: any) => m.id));
    const implicitMethods = ZEN_METHODS.filter((m: any) => {
      if (explicitIds.has(m.id)) return false;
      return (
        m.title.includes(item.title) ||
        m.summary.includes(item.title) ||
        (Array.isArray(m.steps) && m.steps.some((s: string) => s.includes(item.title)))
      );
    });
    relatedMethods = [...explicitMethods, ...implicitMethods].slice(0, 4);
  } else {
    relatedMethods = explicitMethods.slice(0, 4);
  }
  const tradRelatedMethods = relatedMethods.map((m: any) => ({
    ...m,
    title: convertToTrad(m.title),
    summary: convertToTrad(m.summary || ''),
  }));

  // 4. 阐发宗师与交叉概念
  const relatedPersonsData = (item.relatedPersons || [])
    .map((pid: string) => {
      const p = ZEN_PERSONS.find((x: any) => x.id === pid);
      return p ? { ...p, name: convertToTrad(p.name), title: convertToTrad(p.title), era: convertToTrad(p.era) } : null;
    })
    .filter(Boolean);

  const relatedCrossConceptsData = (item.relatedConcepts || [])
    .map((cid: string) => {
      const c = ZEN_CONCEPTS.find((x: any) => x.id === cid);
      return c ? { ...c, title: convertToTrad(c.title), summary: convertToTrad(c.summary || '') } : null;
    })
    .filter(Boolean);

  // 5. 相关问答
  const relatedFaqsData = ZEN_FAQS.filter((f: any) =>
    f.relatedBooks && item.relatedBooks && item.relatedBooks.some((b: string) => f.relatedBooks!.includes(b))
  ).slice(0, 6).map((f: any) => ({
    ...f,
    question: convertToTrad(f.question),
    answer: convertToTrad(f.answer || ''),
  }));

  // 6. 上下篇导航
  const idx = ZEN_CONCEPTS.findIndex((c: any) => c.id === item.id);
  const prevConcept = idx > 0 ? { id: ZEN_CONCEPTS[idx - 1].id, title: convertToTrad(ZEN_CONCEPTS[idx - 1].title) } : null;
  const nextConcept = idx < ZEN_CONCEPTS.length - 1 ? { id: ZEN_CONCEPTS[idx + 1].id, title: convertToTrad(ZEN_CONCEPTS[idx + 1].title) } : null;

  return (
    <>
      <EntityJsonLd item={item} />
      <ConceptDetailPageClient
        params={params}
        initialConcept={tradItem}
        sameCategoryConcepts={sameCategoryConcepts}
        relatedKoans={tradRelatedKoans}
        relatedMethods={tradRelatedMethods}
        relatedPersonsData={relatedPersonsData}
        relatedCrossConceptsData={relatedCrossConceptsData}
        relatedFaqsData={relatedFaqsData}
        prevConcept={prevConcept}
        nextConcept={nextConcept}
      />
    </>
  );
}
