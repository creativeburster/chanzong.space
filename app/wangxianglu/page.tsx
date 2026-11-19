import type { Metadata } from 'next';
import WangXiangluClient from './WangXiangluClient';

export const metadata: Metadata = {
  title: '《王骧陆居士全集》现代白话精译与共读札记',
  description:
    '按册逐节精译《王骧陆居士全集》为纯现代汉语，收录原典金句点睛、半文言对照及实体本体、无念、去习气等共读问答备忘录。',
  alternates: {
    canonical: '/wangxianglu',
    languages: {
      'zh-Hans': '/wangxianglu',
      'zh-Hant': '/zh-tw/wangxianglu',
      'x-default': '/wangxianglu',
    },
  },
  openGraph: {
    type: 'article',
    title: '《王骧陆居士全集》现代白话精译与共读札记 | 禅宗知识库 ChanZong.space',
    description:
      '按册逐节精译《王骧陆居士全集》为纯现代汉语，收录原典金句、半文言对照及心要问答备忘。',
    url: 'https://chanzong.space/wangxianglu',
    locale: 'zh_CN',
    siteName: '禅宗知识库',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禅宗知识库 ChanZong.space' }],
  },
};

export default function WangXiangluPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/wangxianglu#page',
    name: '《王骧陆居士全集》现代白话精译与共读札记',
    description:
      '按原书册目逐节将王骧陆居士著作精译为纯现代汉语，汇总原典金句与深度共读心要问答。',
    url: 'https://chanzong.space/wangxianglu',
    inLanguage: 'zh-CN',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禅宗知识库',
      url: 'https://chanzong.space',
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
