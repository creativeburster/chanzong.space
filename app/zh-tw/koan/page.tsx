import type { Metadata } from 'next';
import KoansPageClient from '@/app/koan/KoansPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '禪宗公案',
  description: `禪宗${STATS.koans}則公案全集——趙州狗子、南泉斬貓、百丈野狐、德山棒臨濟喝等，古德機鋒對決與祖師開悟因緣，附出處與相關經典。`,
  alternates: {
    canonical: '/zh-tw/koan',
    languages: {
      'zh-Hans': '/koan',
      'zh-Hant': '/zh-tw/koan',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪宗公案 | 禪宗知識庫 ChanZong.space',
    description: `禪宗${STATS.koans}則公案——古德機鋒對決與祖師開悟因緣。`,
    url: 'https://chanzong.space/zh-tw/koan',
    locale: 'zh_TW',
  },
};

export default function TradKoansPage() {
  return <KoansPageClient />;
}
