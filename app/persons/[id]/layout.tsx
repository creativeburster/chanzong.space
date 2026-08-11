import type { Metadata } from 'next';
import { ZEN_PERSONS } from '@/lib/taxonomy';

interface LayoutProps {
  params: { id: string };
  children: React.ReactNode;
}

export function generateMetadata({ params }: LayoutProps): Metadata {
  const person = ZEN_PERSONS.find((p) => p.id === params.id);
  if (!person) return {};

  const desc = `${person.name}（${person.title}），${person.era}。${person.teachings?.slice(0, 120) || ''}`;
  return {
    title: `${person.name} · ${person.title}`,
    description: desc.slice(0, 160),
    alternates: { canonical: `/persons/${person.id}` },
    openGraph: {
      type: 'profile',
      title: `${person.name} · ${person.title} | 禅宗知识库`,
      description: desc.slice(0, 160),
      url: `https://chanzong.space/persons/${person.id}`,
      siteName: '禅宗知识库',
      locale: 'zh_CN',
    },
  };
}

export default function PersonLayout({ children }: LayoutProps) {
  return children;
}
