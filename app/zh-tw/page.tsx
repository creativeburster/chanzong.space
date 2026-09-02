import type { Metadata } from 'next';
import HomeClient from '../HomeClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: {
    absolute: '禪宗知識庫 | 頓悟見性之道 | ChanZong.space',
  },
  description: `禪宗知識庫——收錄${STATS.classics}部核心禪宗典籍、${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門、${STATS.faqs}條問答。從達摩四論到無門關、碧巖錄，傳承頓悟見性之道。`,
  alternates: {
    canonical: '/zh-tw',
    languages: {
      'zh-Hans': '/',
      'zh-Hant': '/zh-tw',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪宗知識庫 | 頓悟見性之道 | ChanZong.space',
    description: `收錄${STATS.classics}部禪宗典籍、${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門、${STATS.faqs}條問答。`,
    url: 'https://chanzong.space/zh-tw',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradHomePage() {
  return <HomeClient />;
}
