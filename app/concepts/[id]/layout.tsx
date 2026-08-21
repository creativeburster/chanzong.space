import type { Metadata } from 'next';
import { ZEN_CONCEPTS } from '@/lib/taxonomy';

interface LayoutProps {
  params: { id: string };
  children: React.ReactNode;
}

export function generateMetadata({ params }: LayoutProps): Metadata {
  const concept = ZEN_CONCEPTS.find((c) => c.id === params.id);
  if (!concept) return {};

  return {
    title: `${concept.title} · ${concept.category}`,
    description: concept.summary.slice(0, 160),
    alternates: { canonical: `/concepts/${concept.id}` },
    openGraph: {
      type: 'article',
      title: `${concept.title} | 禅宗知识库 ChanZong.space`,
      description: concept.summary.slice(0, 160),
      url: `https://chanzong.space/concepts/${concept.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
    },
  };
}

export default function ConceptLayout({ children }: LayoutProps) {
  return children;
}
