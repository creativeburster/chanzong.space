import type { Metadata } from 'next';
import GraphClient from './GraphClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '知识图谱',
  description: `禅宗知识图谱——${STATS.concepts}个概念、${STATS.classics}部著作、${STATS.persons}位祖师、${STATS.koans}则公案的关联全景图，交互式探索禅宗法脉与知识关联。`,
  alternates: {
    canonical: '/graph',
    languages: {
      'zh-Hans': '/graph',
      'zh-Hant': '/zh-tw/graph',
      'x-default': '/graph',
    },
  },
  openGraph: {
    type: 'website',
    title: '知识图谱 | 禅宗知识库 ChanZong.space',
    description: `${STATS.concepts}个概念、${STATS.classics}部著作、${STATS.persons}位祖师、${STATS.koans}则公案的关联全景图。`,
    url: 'https://chanzong.space/graph',
    images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禅宗知识库 ChanZong.space' }],
  },
};

export default function GraphPage() {
  return <GraphClient />;
}
