import type { Metadata } from 'next';
import KoanDetailPageClient from './KoanDetailPageClient';
import { ZEN_KOANS } from '@/lib/taxonomy';

interface PageProps { params: { id: string } }



function EntityJsonLd({ item }: { item: any }) {
  const name = String(item.question || '');
  const desc = String(item.context || '').replace(/\s+/g, ' ').slice(0, 160);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Question',
    name,
    description: desc,
    url: `https://chanzong.space/koan/${item.id}`,
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
    alternates: { canonical: `/koan/${params.id}` },
    openGraph: {
      type: 'article',
      title: `${name} · 公案 | 禅宗知识库`,
      description: desc.slice(0, 150) || '公案条目',
      url: `https://chanzong.space/koan/${params.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
    },
  };
}
export default function KoanDetailPagePage({ params }: PageProps) {
  const item = ZEN_KOANS.find((x: any) => x.id === params.id);
  if (!item) return null;
  return (
    <>
      <EntityJsonLd item={item} />
      <KoanDetailPageClient params={params} />
    </>
  );
}

