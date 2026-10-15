import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PersonDetailPageClient from './PersonDetailPageClient';
import { ZEN_PERSONS } from '@/lib/taxonomy';

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
  return (
    <>
      <EntityJsonLd item={item} />
      <PersonDetailPageClient params={params} />
    </>
  );
}

