import type { Metadata } from 'next';
import { ZEN_KOANS } from '@/lib/taxonomy';

interface LayoutProps {
  params: { id: string };
  children: React.ReactNode;
}

export function generateMetadata({ params }: LayoutProps): Metadata {
  const koan = ZEN_KOANS.find((k) => k.id === params.id);
  if (!koan) return {};

  const desc = `${koan.question} —— ${koan.master}禅师开示。${koan.interpretation?.slice(0, 80) || ''}`;
  return {
    title: `${koan.question.slice(0, 20)}… · 禅宗公案`,
    description: desc.slice(0, 160),
    alternates: { canonical: `/koan/${koan.id}` },
    openGraph: {
      type: 'article',
      title: `${koan.question.slice(0, 30)} | 禅宗知识库 ChanZong.space`,
      description: desc.slice(0, 160),
      url: `https://chanzong.space/koan/${koan.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
    },
  };
}

export default function KoanLayout({ children }: LayoutProps) {
  return children;
}
