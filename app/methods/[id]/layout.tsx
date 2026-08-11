import type { Metadata } from 'next';
import { ZEN_METHODS } from '@/lib/taxonomy';

interface LayoutProps {
  params: { id: string };
  children: React.ReactNode;
}

export function generateMetadata({ params }: LayoutProps): Metadata {
  const method = ZEN_METHODS.find((m) => m.id === params.id);
  if (!method) return {};

  return {
    title: `${method.title} · 修持法门`,
    description: method.summary.slice(0, 160),
    alternates: { canonical: `/methods/${method.id}` },
    openGraph: {
      type: 'article',
      title: `${method.title} | 禅宗知识库`,
      description: method.summary.slice(0, 160),
      url: `https://chanzong.space/methods/${method.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
    },
  };
}

export default function MethodLayout({ children }: LayoutProps) {
  return children;
}
