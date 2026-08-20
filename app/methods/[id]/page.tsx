import type { Metadata } from 'next';
import MethodDetailPageClient from './MethodDetailPageClient';
import { ZEN_METHODS } from '@/lib/taxonomy';

interface PageProps { params: { id: string } }



function EntityJsonLd({ item }: { item: any }) {
  const name = String(item.title || '');
  const desc = String(item.summary || '').replace(/\s+/g, ' ').slice(0, 160);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Thing',
    name,
    description: desc,
    url: `https://chanzong.space/methods/${item.id}`,
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
    alternates: { canonical: `/methods/${params.id}` },
    openGraph: {
      type: 'article',
      title: `${name} · 法门 | 禅宗知识库`,
      description: desc.slice(0, 150) || '法门条目',
      url: `https://chanzong.space/methods/${params.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
    },
  };
}
export default function MethodDetailPagePage({ params }: PageProps) {
  const item = ZEN_METHODS.find((x: any) => x.id === params.id);
  if (!item) return null;
  return (
    <>
      <EntityJsonLd item={item} />
      <MethodDetailPageClient params={params} />
    </>
  );
}

