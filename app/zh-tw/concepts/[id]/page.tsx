import type { Metadata } from 'next';
import ConceptDetailPageClient from '@/app/concepts/[id]/ConceptDetailPageClient';
import { ZEN_CONCEPTS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

interface PageProps { params: { id: string } }

export function generateStaticParams() {
  return ZEN_CONCEPTS.map((x: any) => ({ id: x.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = ZEN_CONCEPTS.find((x: any) => x.id === params.id);
  if (!item) return {};
  const name = convertToTrad(String(item.title || params.id));
  const desc = convertToTrad(String(item.summary || '')).replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 概念`;
  return {
    title,
    description: desc || '概念條目',
    alternates: {
      canonical: `/zh-tw/concepts/${params.id}`,
      languages: {
        'zh-Hans': `/concepts/${params.id}`,
        'zh-Hant': `/zh-tw/concepts/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 概念 | 禪宗知識庫`,
      description: desc.slice(0, 150) || '概念條目',
      url: `https://chanzong.space/zh-tw/concepts/${params.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
    },
  };
}

export default function TradConceptDetailPage({ params }: PageProps) {
  const item = ZEN_CONCEPTS.find((x: any) => x.id === params.id);
  if (!item) return null;
  return <ConceptDetailPageClient params={params} />;
}
