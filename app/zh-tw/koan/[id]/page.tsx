import type { Metadata } from 'next';
import KoanDetailPageClient from '@/app/koan/[id]/KoanDetailPageClient';
import { ZEN_KOANS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

interface PageProps { params: { id: string } }

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
      },
    },
    openGraph: {
      type: 'article',
      title: `${name} · 公案 | 禪宗知識庫`,
      description: desc.slice(0, 150) || '公案條目',
      url: `https://chanzong.space/zh-tw/koan/${params.id}`,
      siteName: '禪宗知識庫',
      locale: 'zh_TW',
    },
  };
}

export default function TradKoanDetailPage({ params }: PageProps) {
  const item = ZEN_KOANS.find((x: any) => x.id === params.id);
  if (!item) return null;
  return <KoanDetailPageClient params={params} />;
}
