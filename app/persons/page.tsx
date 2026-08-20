import type { Metadata } from 'next';
import PersonsPageClient from './PersonsPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '祖师',
  description: '禅宗知识库·祖师：传承顿悟见性之道。',
  alternates: { canonical: '/persons' },
  openGraph: {
    type: 'website',
    title: '祖师',
    description: '禅宗知识库·祖师，传承顿悟见性之道。',
    url: 'https://chanzong.space/persons',
  },
};

export default function PersonsPagePage() {
  return <PersonsPageClient />;
}
