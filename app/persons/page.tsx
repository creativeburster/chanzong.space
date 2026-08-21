import type { Metadata } from 'next';
import PersonsPageClient from './PersonsPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '历代祖师',
  description: `禅宗${STATS.persons}位历代祖师——从菩提达摩、六祖惠能到马祖道一、临济义玄、赵州从谂，五家七宗宗师传记、悟道因缘与教学风格。`,
  alternates: { canonical: '/persons' },
  openGraph: {
    type: 'website',
    title: '历代祖师 | 禅宗知识库 ChanZong.space',
    description: `禅宗${STATS.persons}位历代祖师传记、悟道因缘与教学风格。`,
    url: 'https://chanzong.space/persons',
  },
};

export default function PersonsPagePage() {
  return <PersonsPageClient />;
}
