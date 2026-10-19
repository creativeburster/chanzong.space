import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KoanDetailPageClient from './KoanDetailPageClient';
import { ZEN_KOANS, ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_FAQS } from '@/lib/taxonomy';

interface PageProps { params: { id: string } }

export const dynamicParams = false;

function EntityJsonLd({ item }: { item: any }) {
  const name = String(item.question || '');
  const desc = String(item.context || item.interpretation || item.answer || '').replace(/\s+/g, ' ').slice(0, 160);
  const answerText = [
    item.answer ? `【祖师答语】${item.answer}` : '',
    item.context ? `【因缘背景】${item.context}` : '',
    item.interpretation ? `【宗门义解】${item.interpretation}` : '',
  ].filter(Boolean).join('\n\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    '@id': `https://chanzong.space/koan/${item.id}#koan`,
    mainEntity: {
      '@type': 'Question',
      name,
      text: item.question,
      answerCount: 1,
      author: item.master ? {
        '@type': 'Person',
        name: item.master,
      } : undefined,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerText || item.answer || '宗门公案机锋开示',
        author: item.master ? {
          '@type': 'Person',
          name: item.master,
        } : undefined,
        url: `https://chanzong.space/koan/${item.id}`,
      },
    },
    url: `https://chanzong.space/koan/${item.id}`,
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
  return ZEN_KOANS.map((x: any) => ({ id: x.id }));
}


export function generateMetadata({ params }: PageProps): Metadata {
  const item = ZEN_KOANS.find((x: any) => x.id === params.id);
  if (!item) return {};
  const name = String(item.question || params.id);
  const rawDesc = String(item.context || '');
  const desc = rawDesc.replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 公案`;
  return {
    title,
    description: desc || '公案条目',
    alternates: {
      canonical: `/koan/${params.id}`,
      languages: {
        'zh-Hans': `/koan/${params.id}`,
        'zh-Hant': `/zh-tw/koan/${params.id}`,
        'x-default': `/koan/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 公案 | 禅宗知识库`,
      description: desc.slice(0, 150) || '公案条目',
      url: `https://chanzong.space/koan/${params.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
      images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禅宗知识库 ChanZong.space' }],
    },
  };
}
export default function KoanDetailPagePage({ params }: PageProps) {
  const item = ZEN_KOANS.find((x: any) => x.id === params.id);
  if (!item) {
    notFound();
  }

  // 服务端预先计算关联数据，避免客户端组件打包 3.8MB 全量 taxonomy 库
  const sameMasterKoans = item.master
    ? ZEN_KOANS.filter((k: any) => k.id !== item.id && (k.master === item.master || (k.master && item.master && (k.master.includes(item.master) || item.master.includes(k.master))))).slice(0, 6)
    : [];

  const sameBookKoans = ZEN_KOANS.filter((k: any) => {
    if (k.id === item.id) return false;
    if (item.relatedBooks && item.relatedBooks.length > 0 && k.relatedBooks) {
      if (k.relatedBooks.some((b: string) => item.relatedBooks.includes(b))) return true;
    }
    if (item.source && k.source && (k.source.includes(item.source) || item.source.includes(k.source))) {
      return true;
    }
    return false;
  }).slice(0, 6);

  const masterIds = new Set(sameMasterKoans.map((k: any) => k.id));
  const bookIds = new Set(sameBookKoans.map((k: any) => k.id));
  const sameConceptKoans = (item.relatedConcepts && item.relatedConcepts.length > 0)
    ? ZEN_KOANS.filter((k: any) => {
        if (k.id === item.id || masterIds.has(k.id) || bookIds.has(k.id)) return false;
        return k.relatedConcepts && k.relatedConcepts.some((c: string) => item.relatedConcepts.includes(c));
      }).slice(0, 6)
    : [];

  const relatedPersonsData = (item.relatedPersons || [])
    .map((pid: string) => ZEN_PERSONS.find((p: any) => p.id === pid))
    .filter(Boolean);

  const relatedConceptsData = (item.relatedConcepts || [])
    .map((cid: string) => ZEN_CONCEPTS.find((c: any) => c.id === cid))
    .filter(Boolean);

  const relatedMethodsData = ZEN_METHODS.filter((m: any) =>
    m.relatedConcepts && item.relatedConcepts && m.relatedConcepts.some((c: string) => item.relatedConcepts.includes(c))
  ).slice(0, 6);

  const relatedFaqsData = ZEN_FAQS.filter((f: any) =>
    f.relatedBooks && item.source && f.relatedBooks.some((b: string) => item.source.includes(b))
  ).slice(0, 6);

  const idx = ZEN_KOANS.findIndex((k: any) => k.id === item.id);
  const prevKoan = idx > 0 ? { id: ZEN_KOANS[idx - 1].id, title: ZEN_KOANS[idx - 1].question } : null;
  const nextKoan = idx < ZEN_KOANS.length - 1 ? { id: ZEN_KOANS[idx + 1].id, title: ZEN_KOANS[idx + 1].question } : null;

  return (
    <>
      <EntityJsonLd item={item} />
      <KoanDetailPageClient
        params={params}
        initialQa={item}
        sameMasterKoans={sameMasterKoans}
        sameBookKoans={sameBookKoans}
        sameConceptKoans={sameConceptKoans}
        relatedPersonsData={relatedPersonsData}
        relatedConceptsData={relatedConceptsData}
        relatedMethodsData={relatedMethodsData}
        relatedFaqsData={relatedFaqsData}
        prevKoan={prevKoan}
        nextKoan={nextKoan}
      />
    </>
  );
}

