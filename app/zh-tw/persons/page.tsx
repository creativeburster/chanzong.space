import type { Metadata } from 'next';
import PersonsPageClient from '@/app/persons/PersonsPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '禪門人物',
  description: `禪宗${STATS.persons}位禪門人物——從菩提達摩、六祖惠能到馬祖道一、臨濟義玄、趙州從諗，禪師傳記、悟道因緣與教學風格。`,
  alternates: {
    canonical: '/zh-tw/persons',
    languages: {
      'zh-Hans': '/persons',
      'zh-Hant': '/zh-tw/persons',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪門人物 | 禪宗知識庫 ChanZong.space',
    description: `禪宗${STATS.persons}位禪門人物傳記、悟道因緣與教學風格。`,
    url: 'https://chanzong.space/zh-tw/persons',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradPersonsPage() {
  return <PersonsPageClient />;
}
