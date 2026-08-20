import type { Metadata } from 'next';
import ConceptsPageClient from './ConceptsPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '核心概念',
  description: '禅宗知识库·概念：传承顿悟见性之道。',
  alternates: { canonical: '/concepts' },
  openGraph: {
    type: 'website',
    title: '核心概念',
    description: '禅宗知识库·概念，传承顿悟见性之道。',
    url: 'https://chanzong.space/concepts',
  },
};

export default function ConceptsPagePage() {
  return <ConceptsPageClient />;
}
