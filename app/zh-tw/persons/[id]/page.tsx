import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PersonDetailPageClient from '@/app/persons/[id]/PersonDetailPageClient';
import { ZEN_PERSONS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

interface PageProps { params: { id: string } }

export const dynamicParams = false;

function EntityJsonLd({ item }: { item: any }) {
  const name = convertToTrad(String(item.name || ''));
  const desc = convertToTrad(String(item.teachings || '')).replace(/\s+/g, ' ').slice(0, 160);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: desc,
    url: `https://chanzong.space/zh-tw/persons/${item.id}`,
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
  return (
    <>
      <EntityJsonLd item={item} />
      <PersonDetailPageClient params={params} />
    </>
  );
}
