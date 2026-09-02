import type { Metadata } from 'next';
import PersonDetailPageClient from './PersonDetailPageClient';
import { ZEN_PERSONS } from '@/lib/taxonomy';

interface PageProps { params: { id: string } }



function EntityJsonLd({ item }: { item: any }) {
  const name = String(item.name || '');
  const desc = String(item.teachings || '').replace(/\s+/g, ' ').slice(0, 160);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: desc,
    url: `https://chanzong.space/persons/${item.id}`,
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
export default function PersonDetailPagePage({ params }: PageProps) {
  const item = ZEN_PERSONS.find((x: any) => x.id === params.id);
  if (!item) return null;
  return (
    <>
      <EntityJsonLd item={item} />
      <PersonDetailPageClient params={params} />
    </>
  );
}

