import type { Metadata } from 'next';
import ConceptDetailPageClient from './ConceptDetailPageClient';
import { ZEN_CONCEPTS } from '@/lib/taxonomy';

interface PageProps { params: { id: string } }



function EntityJsonLd({ item }: { item: any }) {
  const name = String(item.title || '');
  const desc = String(item.summary || '').replace(/\s+/g, ' ').slice(0, 160);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Concept',
    name,
    description: desc,
    url: `https://chanzong.space/concepts/${item.id}`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function generateStaticParams() {
  return ZEN_CONCEPTS.map((x: any) => ({ id: x.id }));
}


export function generateMetadata({ params }: PageProps): Metadata {
  const item = ZEN_CONCEPTS.find((x: any) => x.id === params.id);
  if (!item) return {};
  const name = String(item.title || params.id);
  const rawDesc = String(item.summary || '');
  const desc = rawDesc.replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 概念`;
  return {
    title,
    description: desc || '概念条目',
    alternates: {
      canonical: `/concepts/${params.id}`,
      languages: {
        'zh-Hans': `/concepts/${params.id}`,
        'zh-Hant': `/zh-tw/concepts/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 概念 | 禅宗知识库 ChanZong.space`,
      description: desc.slice(0, 150) || '概念条目',
      url: `https://chanzong.space/concepts/${params.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
    },
  };
}
export default function ConceptDetailPagePage({ params }: PageProps) {
  const item = ZEN_CONCEPTS.find((x: any) => x.id === params.id);
  if (!item) return null;
  return (
    <>
      <EntityJsonLd item={item} />
      <ConceptDetailPageClient params={params} />
    </>
  );
}

