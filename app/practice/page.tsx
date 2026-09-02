import type { Metadata } from 'next';
import PracticeClient from './PracticeClient';

export const metadata: Metadata = {
  title: '禅修静心工坊 | 每日机锋 · 电子木鱼 · 坐禅计时',
  description: '禅宗知识库禅修工坊——提供每日机锋灵签参究、纯原生仿真电子木鱼、坐禅数息入定计时器，助您于日常尘劳中歇下狂心，体悟自性空灵。',
  alternates: {
    canonical: '/practice',
    languages: {
      'zh-Hans': '/practice',
      'zh-Hant': '/zh-tw/practice',
    },
  },
  openGraph: {
    type: 'website',
    title: '禅修静心工坊 | 禅宗知识库 ChanZong.space',
    description: '每日机锋灵签参究、纯原生仿真电子木鱼、坐禅数息入定计时器。',
    url: 'https://chanzong.space/practice',
    locale: 'zh_CN',
    siteName: '禅宗知识库',
  },
};

export default function PracticePage() {
  return <PracticeClient />;
}
