import type { Metadata } from 'next';
import WangXiangluClient from '@/app/wangxianglu/WangXiangluClient';

export const metadata: Metadata = {
  title: '《王驤陸居士全集》現代白話精譯與共讀札記',
  description:
    '按冊逐節精譯《王驤陸居士全集》為純現代漢語，收錄原典金句點睛、半文言對照及實體本體、無念、去習氣等共讀問答備忘錄。',
  alternates: {
    canonical: '/zh-tw/wangxianglu',
    languages: {
      'zh-Hans': '/wangxianglu',
      'zh-Hant': '/zh-tw/wangxianglu',
      'x-default': '/wangxianglu',
    },
  },
  openGraph: {
    type: 'article',
    title: '《王驤陸居士全集》現代白話精譯與共讀札記 | 禪宗知識庫 ChanZong.space',
    description:
      '按冊逐節精譯《王驤陸居士全集》為純現代漢語，收錄原典金句、半文言對照及心要問答備忘。',
    url: 'https://chanzong.space/zh-tw/wangxianglu',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禪宗知識庫 ChanZong.space' }],
  },
};

export default function TradWangXiangluPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/zh-tw/wangxianglu#page',
    name: '《王驤陸居士全集》現代白話精譯與共讀札記',
    description:
      '按原書冊目逐節將王驤陸居士著作精譯為純現代漢語，匯總原典金句與深度共讀心要問答。',
    url: 'https://chanzong.space/zh-tw/wangxianglu',
    inLanguage: 'zh-TW',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禪宗知識庫',
      url: 'https://chanzong.space/zh-tw',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WangXiangluClient />
    </>
  );
}
