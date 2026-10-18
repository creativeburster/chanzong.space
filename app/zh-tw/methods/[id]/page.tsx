import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MethodDetailPageClient from '@/app/methods/[id]/MethodDetailPageClient';
import { ZEN_METHODS, ZEN_PERSONS, ZEN_CONCEPTS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

interface PageProps { params: { id: string } }

export const dynamicParams = false;

function EntityJsonLd({ item }: { item: any }) {
  const name = convertToTrad(String(item.title || ''));
  const desc = convertToTrad(String(item.summary || '')).replace(/\s+/g, ' ').slice(0, 160);
  const steps = Array.isArray(item.steps) ? item.steps.map((s: string, idx: number) => ({
    '@type': 'HowToStep',
    position: idx + 1,
    name: `第 ${idx + 1} 步`,
    text: convertToTrad(s),
  })) : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `https://chanzong.space/zh-tw/methods/${item.id}#method`,
    name: `禪宗修持法門 · ${name}`,
    description: desc,
    step: steps,
    url: `https://chanzong.space/zh-tw/methods/${item.id}`,
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
  return ZEN_METHODS.map((x: any) => ({ id: x.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = ZEN_METHODS.find((x: any) => x.id === params.id);
  if (!item) return {};
  const name = convertToTrad(String(item.title || params.id));
  const desc = convertToTrad(String(item.summary || '')).replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 法門`;
  return {
    title,
    description: desc || '法門條目',
    alternates: {
      canonical: `/zh-tw/methods/${params.id}`,
      languages: {
        'zh-Hans': `/methods/${params.id}`,
        'zh-Hant': `/zh-tw/methods/${params.id}`,
        'x-default': `/methods/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 法門 | 禪宗知識庫 ChanZong.space`,
      description: desc.slice(0, 150) || '法門條目',
      url: `https://chanzong.space/zh-tw/methods/${params.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
    },
  };
}

export default function TradMethodDetailPage({ params }: PageProps) {
  const item = ZEN_METHODS.find((x: any) => x.id === params.id);
  if (!item) {
    notFound();
  }

  // 服务端预先计算繁体化关联数据，彻底消除客户端水合闪回与 3.8MB 全量 bundle
  const tradItem = {
    ...item,
    title: convertToTrad(item.title),
    summary: convertToTrad(item.summary || ''),
    origin: item.origin ? convertToTrad(item.origin) : item.origin,
    classicRef: item.classicRef ? convertToTrad(item.classicRef) : item.classicRef,
    steps: Array.isArray(item.steps) ? item.steps.map((s: string) => convertToTrad(s)) : item.steps,
    pitfalls: Array.isArray(item.pitfalls) ? item.pitfalls.map((p: string) => convertToTrad(p)) : item.pitfalls,
  };

  const otherMethods = ZEN_METHODS.filter((m: any) => {
    if (m.id === item.id) return false;
    const shareConcept = m.relatedConcepts && item.relatedConcepts && m.relatedConcepts.some((c: string) => item.relatedConcepts.includes(c));
    const sharePerson = m.relatedPersons && item.relatedPersons && m.relatedPersons.some((p: string) => item.relatedPersons.includes(p));
    return shareConcept || sharePerson;
  }).slice(0, 4).map((m: any) => ({
    ...m,
    title: convertToTrad(m.title),
    summary: convertToTrad(m.summary || ''),
  }));

  const relatedKoans = ZEN_KOANS.filter((q: any) => {
    const matchConcept = q.relatedConcepts && item.relatedConcepts && q.relatedConcepts.some((c: string) => item.relatedConcepts.includes(c));
    const matchPerson = q.relatedPersons && item.relatedPersons && q.relatedPersons.some((p: string) => item.relatedPersons.includes(p));
    const matchText = q.question.includes(item.title) || q.answer.includes(item.title);
    return matchConcept || matchPerson || matchText;
  }).slice(0, 6).map((q: any) => ({
    ...q,
    question: convertToTrad(q.question),
    answer: convertToTrad(q.answer),
    master: q.master ? convertToTrad(q.master) : q.master,
  }));

  const relatedPersonsData = (item.relatedPersons || [])
    .map((pid: string) => {
      const p = ZEN_PERSONS.find((x: any) => x.id === pid);
      return p ? { ...p, name: convertToTrad(p.name), title: convertToTrad(p.title), era: convertToTrad(p.era) } : null;
    })
    .filter(Boolean);

  const relatedConceptsData = (item.relatedConcepts || [])
    .map((cid: string) => {
      const c = ZEN_CONCEPTS.find((x: any) => x.id === cid);
      return c ? { ...c, title: convertToTrad(c.title), summary: convertToTrad(c.summary || '') } : null;
    })
    .filter(Boolean);

  const relatedFaqsData = ZEN_FAQS.filter((f: any) =>
    f.relatedBooks && item.relatedBooks && f.relatedBooks.some((b: string) => item.relatedBooks.includes(b))
  ).slice(0, 6).map((f: any) => ({
    ...f,
    question: convertToTrad(f.question),
    answer: convertToTrad(f.answer || ''),
  }));

  const idx = ZEN_METHODS.findIndex((m: any) => m.id === item.id);
  const prevMethod = idx > 0 ? { id: ZEN_METHODS[idx - 1].id, title: convertToTrad(ZEN_METHODS[idx - 1].title) } : null;
  const nextMethod = idx < ZEN_METHODS.length - 1 ? { id: ZEN_METHODS[idx + 1].id, title: convertToTrad(ZEN_METHODS[idx + 1].title) } : null;

  return (
    <>
      <EntityJsonLd item={item} />
      <MethodDetailPageClient
        params={params}
        initialMethod={tradItem}
        otherMethods={otherMethods}
        relatedKoans={relatedKoans}
        relatedPersonsData={relatedPersonsData}
        relatedConceptsData={relatedConceptsData}
        relatedFaqsData={relatedFaqsData}
        prevMethod={prevMethod}
        nextMethod={nextMethod}
      />
    </>
  );
}
