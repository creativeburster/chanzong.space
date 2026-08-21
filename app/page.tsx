import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  description: `禅宗知识库——收录${STATS.classics}部核心禅宗典籍、${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门、${STATS.faqs}条问答。从达摩四论到无门关、碧岩录，传承顿悟见性之道。`,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: '禅宗知识库 | 顿悟见性之道 | ChanZong.space',
    description: `收录${STATS.classics}部禅宗典籍、${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门、${STATS.faqs}条问答。`,
    url: 'https://chanzong.space/',
  },
};

export default function HomePage() {
  return <HomeClient />;
}
