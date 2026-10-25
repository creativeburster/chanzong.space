import type { Metadata } from 'next';
import PracticeClient from '@/app/practice/PracticeClient';

export const metadata: Metadata = {
  title: '禪修靜心工坊 | 每日機鋒 · 電子木魚 · 坐禪計時 · 看話參禪',
  description: '禪宗知識庫禪修工坊——提供每日機鋒靈籤參究、純原生仿真電子木魚、坐禪數息入定計時器、看話頭參究台、茶禪一味與十牛圖漸修自測，助您於日常塵勞中歇下狂心，體悟自性空靈。',
  alternates: {
    canonical: '/zh-tw/practice',
    languages: {
      'zh-Hans': '/practice',
      'zh-Hant': '/zh-tw/practice',
      'x-default': '/practice',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪修靜心工坊 | 禪宗知識庫 ChanZong.space',
    description: '每日機鋒靈籤參究、純原生仿真電子木魚、坐禪數息入定計時器、看話頭參究台與十牛圖自測。',
    url: 'https://chanzong.space/zh-tw/practice',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禪宗知識庫 ChanZong.space' }],
  },
};

export default function TradPracticePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': 'https://chanzong.space/zh-tw/practice#app',
    name: '禪宗知識庫 · 禪修靜心工坊',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'All',
    isAccessibleForFree: true,
    description: '集成每日機鋒靈籤、Web Audio 原生合成電子木魚、坐禪數息計時器、看話頭參究台、禪堂白噪音、經文靜心臨摹、茶禪一味行茶儀軌與十牛圖修心自測的線上交互式禪修工具集。',
    url: 'https://chanzong.space/zh-tw/practice',
    inLanguage: 'zh-TW',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禪宗知識庫',
      url: 'https://chanzong.space/zh-tw',
    },
    featureList: [
      '每日機鋒靈籤抽籤與公案解籤',
      'Web Audio 原生合成電子木魚與引磬助念',
      '坐禪止靜計時器與四七八數息法引導',
      '看話頭參究台（疑情蓄力與鐘板破參）',
      '禪堂自然環境音景混音器',
      '禪籍核心名句靜心臨摹抄經',
      '茶禪一味五步行茶止語定時器',
      '廓庵十牛圖十階心性契合度自測',
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
