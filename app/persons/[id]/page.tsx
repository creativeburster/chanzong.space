import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PersonDetailPageClient from './PersonDetailPageClient';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

interface PageProps { params: { id: string } }

export const dynamicParams = false;

export function generateStaticParams() {
  return ZEN_PERSONS.map((x: any) => ({ id: x.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = ZEN_PERSONS.find((x: any) => x.id === params.id);
  if (!item) return {};
  const name = String(item.name || params.id);
  const rawDesc = String(item.teachings || '');
  const desc = rawDesc.replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 人物`;
  return {
    title,
    description: desc || '人物条目',
    alternates: {
      canonical: `/persons/${params.id}`,
      languages: {
        'zh-Hans': `/persons/${params.id}`,
        'zh-Hant': `/zh-tw/persons/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 人物 | 禅宗知识库`,
      description: desc.slice(0, 150) || '人物条目',
      url: `https://chanzong.space/persons/${params.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
    },
  };
}

function EntityJsonLd({ item }: { item: any }) {
  const name = String(item.name || '');
  const desc = String(item.teachings || '').replace(/\s+/g, ' ').slice(0, 160);
  const knows = (item.relatedPersons || []).map((rid: string) => {
    const rp = ZEN_PERSONS.find((p: any) => p.id === rid);
    return {
      '@type': 'Person',
      name: rp ? rp.name : rid,
      url: `https://chanzong.space/persons/${rid}`,
    };
  });
  const subjectOf = (item.relatedBooks || []).map((bid: string) => ({
    '@type': 'Book',
    url: `https://chanzong.space/classics/${bid}`,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: item.title,
    description: desc,
    url: `https://chanzong.space/persons/${item.id}`,
    knows: knows.length > 0 ? knows : undefined,
    subjectOf: subjectOf.length > 0 ? subjectOf : undefined,
    hasOccupation: {
      '@type': 'Occupation',
      name: '禅宗祖师 / 佛教高僧',
    },
    inLanguage: 'zh-CN',
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function PersonDetailPagePage({ params }: PageProps) {
  const item = ZEN_PERSONS.find((x: any) => x.id === params.id);
  if (!item) {
    notFound();
  }

  // 1. 祖师机锋公案
  const pName = item.name;
  const personKoans = ZEN_KOANS.filter((q: any) => {
    if (q.relatedPersons && q.relatedPersons.includes(item.id)) return true;
    if (q.master && (q.master === pName || q.master.includes(pName) || pName.includes(q.master))) return true;
    return false;
  });

  // 2. 传授法门
  const fromPersonMethods = (item.relatedMethods || []).map((mid: string) => ZEN_METHODS.find((m: any) => m.id === mid)).filter(Boolean);
  const fromMethods = ZEN_METHODS.filter((m: any) => m.relatedPersons && m.relatedPersons.includes(item.id));
  const methodMap = new Map<string, any>();
  [...fromPersonMethods, ...fromMethods].forEach((m: any) => methodMap.set(m.id, m));
  const personMethods = Array.from(methodMap.values());

  // 3. 阐发核心概念
  const fromPersonConcepts = (item.relatedConcepts || []).map((cid: string) => ZEN_CONCEPTS.find((c: any) => c.id === cid)).filter(Boolean);
  const fromConcepts = ZEN_CONCEPTS.filter((c: any) => c.relatedPersons && c.relatedPersons.includes(item.id));
  const conceptMap = new Map<string, any>();
  [...fromPersonConcepts, ...fromConcepts].forEach((c: any) => conceptMap.set(c.id, c));
  const personConcepts = Array.from(conceptMap.values());

  // 4. 师承祖师
  const relatedPersonsData = (item.relatedPersons || [])
    .map((rid: string) => ZEN_PERSONS.find((p: any) => p.id === rid))
    .filter(Boolean);

  // 5. 相关问答
  const relatedFaqsData = ZEN_FAQS.filter((f: any) =>
    f.relatedBooks && item.relatedBooks && item.relatedBooks.some((b: string) => f.relatedBooks!.includes(b))
  );

  // 6. 上下篇
  const idx = ZEN_PERSONS.findIndex((p: any) => p.id === item.id);
  const prevPerson = idx > 0 ? { id: ZEN_PERSONS[idx - 1].id, title: ZEN_PERSONS[idx - 1].name } : null;
  const nextPerson = idx < ZEN_PERSONS.length - 1 ? { id: ZEN_PERSONS[idx + 1].id, title: ZEN_PERSONS[idx + 1].name } : null;

  return (
    <>
      <EntityJsonLd item={item} />
      <PersonDetailPageClient
        params={params}
        initialPerson={item}
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

