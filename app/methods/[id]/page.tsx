import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MethodDetailPageClient from './MethodDetailPageClient';
import { ZEN_METHODS, ZEN_PERSONS, ZEN_CONCEPTS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

interface PageProps { params: { id: string } }

export const dynamicParams = false;

function EntityJsonLd({ item }: { item: any }) {
  const name = String(item.title || '');
  const desc = String(item.summary || '').replace(/\s+/g, ' ').slice(0, 160);
  const steps = Array.isArray(item.steps) ? item.steps.map((s: string, idx: number) => ({
    '@type': 'HowToStep',
    position: idx + 1,
    name: `第 ${idx + 1} 步`,
    text: s,
  })) : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `https://chanzong.space/methods/${item.id}#method`,
    name: `禅宗修持法门 · ${name}`,
    description: desc,
    step: steps,
    url: `https://chanzong.space/methods/${item.id}`,
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
  return ZEN_METHODS.map((x: any) => ({ id: x.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = ZEN_METHODS.find((x: any) => x.id === params.id);
  if (!item) return {};
  const name = String(item.title || params.id);
  const rawDesc = String(item.summary || '');
  const desc = rawDesc.replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 法门`;
  return {
    title,
    description: desc || '法门条目',
    alternates: {
      canonical: `/methods/${params.id}`,
      languages: {
        'zh-Hans': `/methods/${params.id}`,
        'zh-Hant': `/zh-tw/methods/${params.id}`,
        'x-default': `/methods/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 法门 | 禅宗知识库`,
      description: desc.slice(0, 150) || '法门条目',
      url: `https://chanzong.space/methods/${params.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
      images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禅宗知识库 ChanZong.space' }],
    },
  };
}

export default function MethodDetailPagePage({ params }: PageProps) {
  const item = ZEN_METHODS.find((x: any) => x.id === params.id);
  if (!item) {
    notFound();
  }

  // 服务端预先计算关联数据，避免客户端组件全量打包 3.8MB taxonomy
  const otherMethods = ZEN_METHODS.filter((m: any) => {
    if (m.id === item.id) return false;
    const shareConcept = m.relatedConcepts && item.relatedConcepts && m.relatedConcepts.some((c: string) => item.relatedConcepts.includes(c));
    const sharePerson = m.relatedPersons && item.relatedPersons && m.relatedPersons.some((p: string) => item.relatedPersons.includes(p));
    return shareConcept || sharePerson;
  }).slice(0, 4);

  const relatedKoans = ZEN_KOANS.filter((q: any) => {
    const matchConcept = q.relatedConcepts && item.relatedConcepts && q.relatedConcepts.some((c: string) => item.relatedConcepts.includes(c));
    const matchPerson = q.relatedPersons && item.relatedPersons && q.relatedPersons.some((p: string) => item.relatedPersons.includes(p));
    const matchText = q.question.includes(item.title) || q.answer.includes(item.title);
    return matchConcept || matchPerson || matchText;
  }).slice(0, 6);

  const relatedPersonsData = (item.relatedPersons || [])
    .map((pid: string) => ZEN_PERSONS.find((p: any) => p.id === pid))
    .filter(Boolean);

  const relatedConceptsData = (item.relatedConcepts || [])
    .map((cid: string) => ZEN_CONCEPTS.find((c: any) => c.id === cid))
    .filter(Boolean);

  const relatedFaqsData = ZEN_FAQS.filter((f: any) =>
    f.relatedBooks && item.relatedBooks && f.relatedBooks.some((b: string) => item.relatedBooks.includes(b))
  ).slice(0, 6);

  const idx = ZEN_METHODS.findIndex((m: any) => m.id === item.id);
  const prevMethod = idx > 0 ? { id: ZEN_METHODS[idx - 1].id, title: ZEN_METHODS[idx - 1].title } : null;
  const nextMethod = idx < ZEN_METHODS.length - 1 ? { id: ZEN_METHODS[idx + 1].id, title: ZEN_METHODS[idx + 1].title } : null;

  return (
    <>
      <EntityJsonLd item={item} />
      <MethodDetailPageClient
        params={params}
        initialMethod={item}
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

