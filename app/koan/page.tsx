import type { Metadata } from 'next';
import KoansPageClient from './KoansPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '禅宗公案',
  description: `禅宗${STATS.koans}则公案全集——赵州狗子、南泉斩猫、百丈野狐、德山棒临济喝等，古德机锋对决与祖师开悟因缘，附出处与相关经典。`,
  alternates: {
    canonical: '/koan',
    languages: {
      'zh-Hans': '/koan',
      'zh-Hant': '/zh-tw/koan',
    },
  },
  openGraph: {
    type: 'website',
    title: '禅宗公案 | 禅宗知识库 ChanZong.space',
    description: `禅宗${STATS.koans}则公案——古德机锋对决与祖师开悟因缘。`,
    url: 'https://chanzong.space/koan',
  },
};

export default function KoansPagePage() {
  return <KoansPageClient />;
}
