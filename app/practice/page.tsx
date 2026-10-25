import type { Metadata } from 'next';
import PracticeClient from './PracticeClient';

export const metadata: Metadata = {
  title: '禅修静心工坊 | 每日机锋 · 电子木鱼 · 坐禅计时 · 看话参禅',
  description: '禅宗知识库禅修工坊——提供每日机锋灵签参究、纯原生仿真电子木鱼、坐禅数息入定计时器、看话头参究台、茶禅一味与十牛图渐修自测，助您于日常尘劳中歇下狂心，体悟自性空灵。',
  alternates: {
    canonical: '/practice',
    languages: {
      'zh-Hans': '/practice',
      'zh-Hant': '/zh-tw/practice',
      'x-default': '/practice',
    },
  },
  openGraph: {
    type: 'website',
    title: '禅修静心工坊 | 禅宗知识库 ChanZong.space',
    description: '每日机锋灵签参究、纯原生仿真电子木鱼、坐禅数息入定计时器、看话头参究台与十牛图自测。',
    url: 'https://chanzong.space/practice',
    locale: 'zh_CN',
    siteName: '禅宗知识库',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禅宗知识库 ChanZong.space' }],
  },
};

export default function PracticePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://chanzong.space/practice#app',
    name: '禅宗知识库 · 禅修静心工坊',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'All',
    isAccessibleForFree: true,
    description: '集成每日机锋灵签、Web Audio 原生合成电子木鱼、坐禅数息计时器、看话头参究台、禅堂白噪音、经文静心临摹、茶禅一味行茶仪轨与十牛图修心自测的在线交互式禅修工具集。',
    url: 'https://chanzong.space/practice',
    inLanguage: 'zh-CN',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禅宗知识库',
      url: 'https://chanzong.space',
    },
    featureList: [
      '每日机锋灵签抽签与公案解签',
      'Web Audio 原生合成电子木鱼与引磬助念',
      '坐禅止静计时器与四七八数息法引导',
      '看话头参究台（疑情蓄力与钟板破参）',
      '禅堂自然环境音景混音器',
      '禅籍核心名句静心临摹抄经',
      '茶禅一味五步行茶止语定时器',
      '廓庵十牛图十阶心性契合度自测',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PracticeClient />
    </>
  );
}
