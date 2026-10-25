import type { Metadata } from 'next';
import { STATS } from '@/lib/stats';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: '关于本站 · 编辑原则与校勘规范',
  description: `禅宗知识库（chanzong.space）的编辑原则、CBETA 文本来源、校勘规范、CC BY-NC-SA 4.0 版权声明与联系方式。收录${STATS.classics}部禅宗核心典籍与${STATS.koans}则公案。`,
  alternates: {
    canonical: '/about',
    languages: {
      'zh-Hans': '/about',
      'zh-Hant': '/zh-tw/about',
      'x-default': '/about',
    },
  },
  openGraph: {
    type: 'website',
    title: '关于本站 | 禅宗知识库 ChanZong.space',
    description: '禅宗知识库的编辑原则、文本来源与版权声明。',
    url: 'https://chanzong.space/about',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禅宗知识库 ChanZong.space' }],
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://chanzong.space/about#about',
    name: '关于禅宗知识库 (ChanZong.space)',
    description: `禅宗知识库（chanzong.space）是一个非营利性禅宗文献数字化与心性修持数字人文平台，收录${STATS.classics}部禅宗原典、${STATS.concepts}个核心概念、${STATS.koans}则公案机锋、${STATS.persons}位历代祖师与${STATS.methods}种修持法门。`,
    url: 'https://chanzong.space/about',
    inLanguage: 'zh-CN',
    mainEntity: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禅宗知识库',
      alternateName: ['ChanZong.space', 'ChanZong Knowledge Base'],
      url: 'https://chanzong.space',
      logo: 'https://chanzong.space/logo-nianhua-new.jpg',
      image: 'https://chanzong.space/og-banner.jpg',
      foundingDate: '2024',
      publishingPrinciples: 'https://chanzong.space/about',
      knowsAbout: ['禅宗', '汉传佛教', 'CBETA 大藏经', '禅宗公案', '看话禅', '默照禅', '唯识学'],
      sameAs: [
        'https://github.com/creativeburster/chanzong.space',
        'https://ramanamaharshi.space',
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
