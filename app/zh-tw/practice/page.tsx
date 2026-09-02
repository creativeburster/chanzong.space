import type { Metadata } from 'next';
import PracticeClient from '@/app/practice/PracticeClient';

export const metadata: Metadata = {
  title: '禪修靜心工坊 | 每日機鋒 · 電子木魚 · 坐禪計時',
  description: '禪宗知識庫禪修工坊——提供每日機鋒靈籤參究、純原生仿真電子木魚、坐禪數息入定計時器，助您於日常塵勞中歇下狂心，體悟自性空靈。',
  alternates: {
    canonical: '/zh-tw/practice',
    languages: {
      'zh-Hans': '/practice',
      'zh-Hant': '/zh-tw/practice',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪修靜心工坊 | 禪宗知識庫 ChanZong.space',
    description: '每日機鋒靈籤參究、純原生仿真電子木魚、坐禪數息入定計時器。',
    url: 'https://chanzong.space/zh-tw/practice',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradPracticePage() {
  return <PracticeClient />;
}
