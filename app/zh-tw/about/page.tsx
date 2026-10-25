import type { Metadata } from 'next';
import { STATS } from '@/lib/stats';
import AboutClient from '@/app/about/AboutClient';

export const metadata: Metadata = {
  title: '關於本站 · 編輯原則與校勘規範',
  description: `禪宗知識庫（chanzong.space）的編輯原則、CBETA 文本來源、校勘規範、CC BY-NC-SA 4.0 版權聲明與聯繫方式。收錄${STATS.classics}部禪宗核心典籍與${STATS.koans}則公案。`,
  alternates: {
    canonical: '/zh-tw/about',
    languages: {
      'zh-Hans': '/about',
      'zh-Hant': '/zh-tw/about',
      'x-default': '/about',
    },
  },
  openGraph: {
    type: 'website',
    title: '關於本站 | 禪宗知識庫 ChanZong.space',
    description: '禪宗知識庫的編輯原則、文本來源與版權聲明。',
    url: 'https://chanzong.space/zh-tw/about',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禪宗知識庫 ChanZong.space' }],
  },
};

export default function TradAboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://chanzong.space/zh-tw/about#about',
    name: '關於禪宗知識庫 (ChanZong.space)',
    description: `禪宗知識庫（chanzong.space）是一個非營利性禪宗文獻數位化與心性修持數位人文平台，收錄${STATS.classics}部禪宗原典、${STATS.concepts}個核心概念、${STATS.koans}則公案機鋒、${STATS.persons}位歷代祖師與${STATS.methods}種修持法門。`,
    url: 'https://chanzong.space/zh-tw/about',
    inLanguage: 'zh-TW',
    mainEntity: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禪宗知識庫',
      alternateName: ['ChanZong.space', 'ChanZong Knowledge Base'],
      url: 'https://chanzong.space/zh-tw',
      logo: 'https://chanzong.space/logo-nianhua-new.jpg',
      image: 'https://chanzong.space/og-banner.jpg',
      foundingDate: '2024',
      publishingPrinciples: 'https://chanzong.space/zh-tw/about',
      knowsAbout: ['禪宗', '漢傳佛教', 'CBETA 大藏經', '禪宗公案', '看話禪', '默照禪', '唯識學'],
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
