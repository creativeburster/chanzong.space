import type { Metadata } from 'next';
import GraphClient from '@/app/graph/GraphClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '知識圖譜',
  description: `禪宗知識圖譜——${STATS.concepts}個概念、${STATS.classics}部著作、${STATS.persons}位祖師、${STATS.koans}則公案的關聯全景圖，交互式探索禪宗法脈與知識關聯。`,
  alternates: {
    canonical: '/zh-tw/graph',
    languages: {
      'zh-Hans': '/graph',
      'zh-Hant': '/zh-tw/graph',
    },
  },
  openGraph: {
    type: 'website',
    title: '知識圖譜 | 禪宗知識庫 ChanZong.space',
    description: `${STATS.concepts}個概念、${STATS.classics}部著作、${STATS.persons}位祖師、${STATS.koans}則公案的關聯全景圖。`,
    url: 'https://chanzong.space/zh-tw/graph',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradGraphPage() {
  return <GraphClient />;
}
