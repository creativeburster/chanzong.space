import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KoanDetailPageClient from '@/app/koan/[id]/KoanDetailPageClient';
import { ZEN_KOANS, ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_FAQS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

interface PageProps { params: { id: string } }

export const dynamicParams = false;

function EntityJsonLd({ item }: { item: any }) {
  const name = convertToTrad(String(item.question || ''));
  const desc = convertToTrad(String(item.context || item.interpretation || item.answer || '')).replace(/\s+/g, ' ').slice(0, 160);
  const answerText = [
    item.answer ? `【祖師答語】${convertToTrad(item.answer)}` : '',
    item.context ? `【因緣背景】${convertToTrad(item.context)}` : '',
    item.interpretation ? `【宗門義解】${convertToTrad(item.interpretation)}` : '',
  ].filter(Boolean).join('\n\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    '@id': `https://chanzong.space/zh-tw/koan/${item.id}#koan`,
    mainEntity: {
      '@type': 'Question',
      name,
      text: name,
      answerCount: 1,
      author: item.master ? {
        '@type': 'Person',
        name: convertToTrad(item.master),
      } : undefined,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerText || (item.answer ? convertToTrad(item.answer) : '宗門公案機鋒開示'),
        author: item.master ? {
          '@type': 'Person',
          name: convertToTrad(item.master),
        } : undefined,
        url: `https://chanzong.space/zh-tw/koan/${item.id}`,
      },
    },
    url: `https://chanzong.space/zh-tw/koan/${item.id}`,
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
  return ZEN_KOANS.map((x: any) => ({ id: x.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = ZEN_KOANS.find((x: any) => x.id === params.id);
  if (!item) return {};
  const name = convertToTrad(String(item.question || params.id));
  const desc = convertToTrad(String(item.context || '')).replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 公案`;
  return {
    title,
    description: desc || '公案條目',
    alternates: {
      canonical: `/zh-tw/koan/${params.id}`,
      languages: {
        'zh-Hans': `/koan/${params.id}`,
        'zh-Hant': `/zh-tw/koan/${params.id}`,
        'x-default': `/koan/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 公案 | 禪宗知識庫 ChanZong.space`,
      description: desc.slice(0, 150) || '公案條目',
      url: `https://chanzong.space/zh-tw/koan/${params.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
      images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禪宗知識庫 ChanZong.space' }],
    },
  };
}

export default function TradKoanDetailPage({ params }: PageProps) {
  const item = ZEN_KOANS.find((x: any) => x.id === params.id);
  if (!item) {
    notFound();
  }

  // 服务端预先计算繁体化关联数据，彻底消除客户端水合闪回与 3.8MB 全量 bundle
  const tradItem = {
    ...item,
    question: convertToTrad(item.question),
    answer: convertToTrad(item.answer),
    master: item.master ? convertToTrad(item.master) : item.master,
    source: item.source ? convertToTrad(item.source) : item.source,
    context: item.context ? convertToTrad(item.context) : item.context,
    interpretation: item.interpretation ? convertToTrad(item.interpretation) : item.interpretation,
  };

  const sameMasterKoans = item.master
    ? ZEN_KOANS.filter((k: any) => k.id !== item.id && (k.master === item.master || (k.master && item.master && (k.master.includes(item.master) || item.master.includes(k.master))))).slice(0, 6).map((k: any) => ({
        ...k,
        question: convertToTrad(k.question),
        answer: convertToTrad(k.answer),
        master: k.master ? convertToTrad(k.master) : k.master,
      }))
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
  }).slice(0, 6).map((k: any) => ({
    ...k,
    question: convertToTrad(k.question),
    answer: convertToTrad(k.answer),
    master: k.master ? convertToTrad(k.master) : k.master,
  }));

  const masterIds = new Set(sameMasterKoans.map((k: any) => k.id));
  const bookIds = new Set(sameBookKoans.map((k: any) => k.id));
  const sameConceptKoans = (item.relatedConcepts && item.relatedConcepts.length > 0)
    ? ZEN_KOANS.filter((k: any) => {
        if (k.id === item.id || masterIds.has(k.id) || bookIds.has(k.id)) return false;
        return k.relatedConcepts && k.relatedConcepts.some((c: string) => item.relatedConcepts.includes(c));
      }).slice(0, 6).map((k: any) => ({
        ...k,
        question: convertToTrad(k.question),
        answer: convertToTrad(k.answer),
        master: k.master ? convertToTrad(k.master) : k.master,
      }))
    : [];

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

  const relatedMethodsData = ZEN_METHODS.filter((m: any) =>
    m.relatedConcepts && item.relatedConcepts && m.relatedConcepts.some((c: string) => item.relatedConcepts.includes(c))
  ).slice(0, 6).map((m: any) => ({
    ...m,
    title: convertToTrad(m.title),
    summary: convertToTrad(m.summary || ''),
  }));

  const relatedFaqsData = ZEN_FAQS.filter((f: any) =>
    f.relatedBooks && item.source && f.relatedBooks.some((b: string) => item.source.includes(b))
  ).slice(0, 6).map((f: any) => ({
    ...f,
    question: convertToTrad(f.question),
    answer: convertToTrad(f.answer || ''),
  }));

  const idx = ZEN_KOANS.findIndex((k: any) => k.id === item.id);
  const prevKoan = idx > 0 ? { id: ZEN_KOANS[idx - 1].id, title: convertToTrad(ZEN_KOANS[idx - 1].question) } : null;
  const nextKoan = idx < ZEN_KOANS.length - 1 ? { id: ZEN_KOANS[idx + 1].id, title: convertToTrad(ZEN_KOANS[idx + 1].question) } : null;

  return (
    <>
      <EntityJsonLd item={item} />
      <KoanDetailPageClient
        params={params}
        initialQa={tradItem}
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
