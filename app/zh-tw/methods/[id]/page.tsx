import type { Metadata } from 'next';
import MethodDetailPageClient from '@/app/methods/[id]/MethodDetailPageClient';
import { ZEN_METHODS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

interface PageProps { params: { id: string } }

export function generateStaticParams() {
  return ZEN_METHODS.map((x: any) => ({ id: x.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = ZEN_METHODS.find((x: any) => x.id === params.id);
  if (!item) return {};
  const name = convertToTrad(String(item.title || params.id));
  const desc = convertToTrad(String(item.summary || '')).replace(/\s+/g, ' ').slice(0, 140);
  const title = `${name} · 法門`;
  return {
    title,
    description: desc || '法門條目',
    alternates: {
      canonical: `/zh-tw/methods/${params.id}`,
      languages: {
        'zh-Hans': `/methods/${params.id}`,
        'zh-Hant': `/zh-tw/methods/${params.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 法門 | 禪宗知識庫`,
      description: desc.slice(0, 150) || '法門條目',
      url: `https://chanzong.space/zh-tw/methods/${params.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
    },
  };
}

export default function TradMethodDetailPage({ params }: PageProps) {
  const item = ZEN_METHODS.find((x: any) => x.id === params.id);
  if (!item) return null;
  return <MethodDetailPageClient params={params} />;
}
