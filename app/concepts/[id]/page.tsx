import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ConceptDetailPageClient from './ConceptDetailPageClient';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

interface PageProps { params: { id: string } }

export const dynamicParams = false;

function EntityJsonLd({ item }: { item: any }) {
  const name = String(item.title || '');
  const desc = String(item.summary || '').replace(/\s+/g, ' ').slice(0, 160);
  const isBasedOn = (item.relatedBooks || []).map((bid: string) => ({
    '@type': 'Book',
    '@id': `https://chanzong.space/classics/${bid}#book`,
    url: `https://chanzong.space/classics/${bid}`,
  }));
  const mentions = (item.relatedPersons || []).map((pid: string) => {
    const p = ZEN_PERSONS.find((x: any) => x.id === pid);
    return {
      '@type': 'Person',
      '@id': `https://chanzong.space/persons/${pid}#person`,
      name: p ? p.name : pid,
      url: `https://chanzong.space/persons/${pid}`,
    };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `https://chanzong.space/concepts/${item.id}#term`,
    name,
    description: desc,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: '禅宗核心心性与修持概念库',
      url: 'https://chanzong.space/concepts',
    },
    ...(isBasedOn.length > 0 ? { isBasedOn } : {}),
    ...(mentions.length > 0 ? { subjectOf: mentions } : {}),
    termCode: item.id,
    url: `https://chanzong.space/concepts/${item.id}`,
    inLanguage: 'zh-CN',
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
  const name = String(item.title || params.id);
  const rawDesc = String(item.summary || '');
  const desc = rawDesc.replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 概念`;
  return {
    title,
    description: desc || '概念条目',
    alternates: {
      canonical: `/concepts/${params.id}`,
      languages: {
        'zh-Hans': `/concepts/${params.id}`,
        'zh-Hant': `/zh-tw/concepts/${params.id}`,
        'x-default': `/concepts/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 概念 | 禅宗知识库 ChanZong.space`,
      description: desc.slice(0, 150) || '概念条目',
      url: `https://chanzong.space/concepts/${params.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
      images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禅宗知识库 ChanZong.space' }],
    },
  };
}

export default function ConceptDetailPagePage({ params }: PageProps) {
  const item = ZEN_CONCEPTS.find((x: any) => x.id === params.id);
  if (!item) {
    notFound();
  }

  const sameCategoryConcepts = item.category
    ? ZEN_CONCEPTS.filter((c: any) => c.id !== item.id && c.category === item.category).slice(0, 6)
    : [];

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

  const relatedPersonsData = (item.relatedPersons || [])
    .map((pid: string) => ZEN_PERSONS.find((p: any) => p.id === pid))
    .filter(Boolean);

  const relatedCrossConceptsData = (item.relatedConcepts || [])
    .map((cid: string) => ZEN_CONCEPTS.find((c: any) => c.id === cid))
    .filter(Boolean);

  const relatedFaqsData = ZEN_FAQS.filter((f: any) =>
    f.relatedBooks && item.relatedBooks && item.relatedBooks.some((b: string) => item.relatedBooks!.includes(b))
  ).slice(0, 6);

  const idx = ZEN_CONCEPTS.findIndex((c: any) => c.id === item.id);
  const prevConcept = idx > 0 ? { id: ZEN_CONCEPTS[idx - 1].id, title: ZEN_CONCEPTS[idx - 1].title } : null;
  const nextConcept = idx < ZEN_CONCEPTS.length - 1 ? { id: ZEN_CONCEPTS[idx + 1].id, title: ZEN_CONCEPTS[idx + 1].title } : null;

  return (
    <>
      <EntityJsonLd item={item} />
      <ConceptDetailPageClient
        params={params}
        initialConcept={item}
        sameCategoryConcepts={sameCategoryConcepts}
        relatedKoans={relatedKoans}
        relatedMethods={relatedMethods}
        relatedPersonsData={relatedPersonsData}
        relatedCrossConceptsData={relatedCrossConceptsData}
        relatedFaqsData={relatedFaqsData}
        prevConcept={prevConcept}
        nextConcept={nextConcept}
      />
    </>
  );
}
