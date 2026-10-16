import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PersonDetailPageClient from '@/app/persons/[id]/PersonDetailPageClient';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

interface PageProps { params: { id: string } }

export const dynamicParams = false;

function EntityJsonLd({ item }: { item: any }) {
  const name = convertToTrad(String(item.name || ''));
  const desc = convertToTrad(String(item.teachings || '')).replace(/\s+/g, ' ').slice(0, 160);
  const knows = (item.relatedPersons || []).map((rid: string) => {
    const rp = ZEN_PERSONS.find((p: any) => p.id === rid);
    return {
      '@type': 'Person',
      name: rp ? convertToTrad(rp.name) : rid,
      url: `https://chanzong.space/zh-tw/persons/${rid}`,
    };
  });
  const subjectOf = (item.relatedBooks || []).map((bid: string) => ({
    '@type': 'Book',
    url: `https://chanzong.space/zh-tw/classics/${bid}`,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: convertToTrad(item.title || ''),
    description: desc,
    url: `https://chanzong.space/zh-tw/persons/${item.id}`,
    knows: knows.length > 0 ? knows : undefined,
    subjectOf: subjectOf.length > 0 ? subjectOf : undefined,
    hasOccupation: {
      '@type': 'Occupation',
      name: convertToTrad('禅宗祖师 / 佛教高僧'),
    },
    inLanguage: 'zh-TW',
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function generateStaticParams() {
  return ZEN_PERSONS.map((x: any) => ({ id: x.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = ZEN_PERSONS.find((x: any) => x.id === params.id);
  if (!item) return {};
  const name = convertToTrad(String(item.name || params.id));
  const desc = convertToTrad(String(item.teachings || '')).replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 人物`;
  return {
    title,
    description: desc || '人物條目',
    alternates: {
      canonical: `/zh-tw/persons/${params.id}`,
      languages: {
        'zh-Hans': `/persons/${params.id}`,
        'zh-Hant': `/zh-tw/persons/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 人物 | 禪宗知識庫 ChanZong.space`,
      description: desc.slice(0, 150) || '人物條目',
      url: `https://chanzong.space/zh-tw/persons/${params.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
    },
  };
}

export default function TradPersonDetailPage({ params }: PageProps) {
  const item = ZEN_PERSONS.find((x: any) => x.id === params.id);
  if (!item) {
    notFound();
  }

  const tradItem = {
    ...item,
    name: convertToTrad(item.name),
    title: convertToTrad(item.title || ''),
    era: convertToTrad(item.era || ''),
    teachings: convertToTrad(item.teachings || ''),
    lifeStory: item.lifeStory ? convertToTrad(item.lifeStory) : item.lifeStory,
    quotes: Array.isArray(item.quotes) ? item.quotes.map((q: string) => convertToTrad(q)) : item.quotes,
    classics: Array.isArray(item.classics) ? item.classics.map((c: string) => convertToTrad(c)) : item.classics,
  };

  // 1. 祖师机锋公案
  const pName = item.name;
  const personKoans = ZEN_KOANS.filter((q: any) => {
    if (q.relatedPersons && q.relatedPersons.includes(item.id)) return true;
    if (q.master && (q.master === pName || q.master.includes(pName) || pName.includes(q.master))) return true;
    return false;
  }).map((q: any) => ({
    ...q,
    question: convertToTrad(q.question),
    answer: convertToTrad(q.answer),
    master: q.master ? convertToTrad(q.master) : q.master,
  }));

  // 2. 传授法门
  const fromPersonMethods = (item.relatedMethods || []).map((mid: string) => ZEN_METHODS.find((m: any) => m.id === mid)).filter(Boolean);
  const fromMethods = ZEN_METHODS.filter((m: any) => m.relatedPersons && m.relatedPersons.includes(item.id));
  const methodMap = new Map<string, any>();
  [...fromPersonMethods, ...fromMethods].forEach((m: any) => methodMap.set(m.id, m));
  const personMethods = Array.from(methodMap.values()).map((m: any) => ({
    ...m,
    title: convertToTrad(m.title),
    summary: convertToTrad(m.summary || ''),
  }));

  // 3. 阐发核心概念
  const fromPersonConcepts = (item.relatedConcepts || []).map((cid: string) => ZEN_CONCEPTS.find((c: any) => c.id === cid)).filter(Boolean);
  const fromConcepts = ZEN_CONCEPTS.filter((c: any) => c.relatedPersons && c.relatedPersons.includes(item.id));
  const conceptMap = new Map<string, any>();
  [...fromPersonConcepts, ...fromConcepts].forEach((c: any) => conceptMap.set(c.id, c));
  const personConcepts = Array.from(conceptMap.values()).map((c: any) => ({
    ...c,
    title: convertToTrad(c.title),
    summary: convertToTrad(c.summary || ''),
  }));

  // 4. 师承祖师
  const relatedPersonsData = (item.relatedPersons || [])
    .map((rid: string) => {
      const p = ZEN_PERSONS.find((x: any) => x.id === rid);
      return p ? { ...p, name: convertToTrad(p.name), title: convertToTrad(p.title), era: convertToTrad(p.era) } : null;
    })
    .filter(Boolean);

  // 5. 相关问答
  const relatedFaqsData = ZEN_FAQS.filter((f: any) =>
    f.relatedBooks && item.relatedBooks && item.relatedBooks.some((b: string) => f.relatedBooks!.includes(b))
  ).map((f: any) => ({
    ...f,
    question: convertToTrad(f.question),
    answer: convertToTrad(f.answer || ''),
  }));

  // 6. 上下篇
  const idx = ZEN_PERSONS.findIndex((p: any) => p.id === item.id);
  const prevPerson = idx > 0 ? { id: ZEN_PERSONS[idx - 1].id, title: convertToTrad(ZEN_PERSONS[idx - 1].name) } : null;
  const nextPerson = idx < ZEN_PERSONS.length - 1 ? { id: ZEN_PERSONS[idx + 1].id, title: convertToTrad(ZEN_PERSONS[idx + 1].name) } : null;

  return (
    <>
      <EntityJsonLd item={item} />
      <PersonDetailPageClient
        params={params}
        initialPerson={tradItem}
        personKoans={personKoans}
        personMethods={personMethods}
        personConcepts={personConcepts}
        relatedPersonsData={relatedPersonsData}
        relatedFaqsData={relatedFaqsData}
        prevPerson={prevPerson}
        nextPerson={nextPerson}
      />
    </>
  );
}
