import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import KoanDetailPageClient from '@/app/koan/[id]/KoanDetailPageClient';
import { ZEN_KOANS, ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_FAQS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

interface PageProps { params: { id: string } }

export const dynamicParams = false;

function buildTradKoanTitleAndDesc(item: any): { title: string; desc: string } {
  const name = String(item.question || item.id).trim();
  const master = String(item.master || '').trim();
  const cleanAns = String(item.answer || '').replace(/\s+/g, ' ').replace(/^[“"「]|[”"」]$/g, '').trim();
  const shortAns = cleanAns.length > 14 ? cleanAns.slice(0, 14) + '…' : cleanAns;
  const masterPart = master && !name.includes(master.slice(0, 2)) ? `${master}：` : '';
  const ansPart = shortAns && !name.includes(shortAns.replace(/…$/, '').replace(/[。！？，]/g, '')) ? `「${shortAns}」` : '';
  const baseTitle = `${masterPart}${name}${ansPart}`;
  const srcClean = String(item.source || '').replace(/[《》\s]/g, '').slice(0, 10);

  const duplicates = ZEN_KOANS.filter((k: any) => {
    const n2 = String(k.question || k.id).trim();
    const m2 = String(k.master || '').trim();
    const a2 = String(k.answer || '').replace(/\s+/g, ' ').replace(/^[“"「]|[”"」]$/g, '').trim();
    const s2 = a2.length > 14 ? a2.slice(0, 14) + '…' : a2;
    const mp2 = m2 && !n2.includes(m2.slice(0, 2)) ? `${m2}：` : '';
    const ap2 = s2 && !n2.includes(s2.replace(/…$/, '').replace(/[。！？，]/g, '')) ? `「${s2}」` : '';
    return `${mp2}${n2}${ap2}` === baseTitle;
  });

  let simpTitle = `${baseTitle} · 公案`;
  if (duplicates.length > 1) {
    const sameSrc = duplicates.filter((k: any) => String(k.source || '').replace(/[《》\s]/g, '').slice(0, 10) === srcClean);
    if (sameSrc.length > 1) {
      simpTitle = `${baseTitle}（${srcClean ? srcClean + '·' : ''}${item.id.replace('koan-', '第')}则） · 公案`;
    } else {
      simpTitle = `${baseTitle}（${srcClean || item.id}） · 公案`;
    }
  }

  const combinedDesc = [
    item.context,
    item.interpretation ? `【宗门评唱】${item.interpretation}` : '',
    item.source ? `（出自${item.source}）` : '',
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

  return {
    title: convertToTrad(simpTitle),
    desc: convertToTrad(combinedDesc.slice(0, 145) || '宗门公案机锋开示与义理评唱。'),
  };
}

function EntityJsonLd({ item }: { item: any }) {
  const name = convertToTrad(String(item.question || ''));
  const answerText = [
    item.answer ? `【祖師答語】${convertToTrad(item.answer)}` : '',
    item.context ? `【因緣背景】${convertToTrad(item.context)}` : '',
    item.interpretation ? `【宗門義解】${convertToTrad(item.interpretation)}` : '',
  ].filter(Boolean).join('\n\n');

  const isBasedOn = (item.relatedBooks || []).map((bid: string) => ({
    '@type': 'Book',
    '@id': `https://chanzong.space/zh-tw/classics/${bid}#book`,
    url: `https://chanzong.space/zh-tw/classics/${bid}`,
  }));

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
        ...(item.relatedPersons?.[0] ? { '@id': `https://chanzong.space/zh-tw/persons/${item.relatedPersons[0]}#person` } : {}),
      } : undefined,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answerText || (item.answer ? convertToTrad(item.answer) : '宗門公案機鋒開示'),
        author: item.master ? {
          '@type': 'Person',
          name: convertToTrad(item.master),
          ...(item.relatedPersons?.[0] ? { '@id': `https://chanzong.space/zh-tw/persons/${item.relatedPersons[0]}#person` } : {}),
        } : undefined,
        url: `https://chanzong.space/zh-tw/koan/${item.id}`,
      },
    },
    ...(isBasedOn.length > 0 ? { isBasedOn } : {}),
    publisher: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禪宗知識庫',
      url: 'https://chanzong.space/zh-tw',
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
  const { title, desc } = buildTradKoanTitleAndDesc(item);
  return {
    title,
    description: desc,
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
      title: `${title} | 禪宗知識庫 ChanZong.space`,
      description: desc.slice(0, 150),
      url: `https://chanzong.space/zh-tw/koan/${params.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
      images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禪宗知識庫 ChanZong.space' }],
    },
  };
}

export default function TradKoanDetailPage({ params }: PageProps) {
  const item = ZEN_KOANS.find((x: any) => x.id === params.id);
  if (!item) {
    notFound();
  }

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
