import type { Metadata } from 'next';
import PersonsPageClient from './PersonsPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '禅门人物',
  description: `禅宗${STATS.persons}位禅门人物——从菩提达摩、六祖惠能到马祖道一、临济义玄、赵州从谂，禅师传记、悟道因缘与教学风格。`,
  alternates: { canonical: '/persons' },
  openGraph: {
    type: 'website',
    title: '禅门人物 | 禅宗知识库 ChanZong.space',
    description: `禅宗${STATS.persons}位禅门人物传记、悟道因缘与教学风格。`,
    url: 'https://chanzong.space/persons',
  },
};

export default function PersonsPagePage() {
  return <PersonsPageClient />;
}
