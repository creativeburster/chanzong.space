import type { Metadata } from 'next';
import HomeClient from '../HomeClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: {
    absolute: '禪宗知識庫 | 頓悟見性之道 | ChanZong.space',
  },
  description: `禪宗知識庫——收錄${STATS.classics}部核心禪宗典籍、${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門、${STATS.faqs}條問答。從達摩四論到無門關、碧巖錄，傳承頓悟見性之道。`,
  alternates: {
    canonical: '/zh-tw',
    languages: {
      'zh-Hans': '/',
      'zh-Hant': '/zh-tw',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪宗知識庫 | 頓悟見性之道 | ChanZong.space',
    description: `收錄${STATS.classics}部禪宗典籍、${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門、${STATS.faqs}條問答。`,
    url: 'https://chanzong.space/zh-tw',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradHomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://chanzong.space/zh-tw/#website',
        name: '禪宗知識庫',
        alternateName: ['ChanZong.space', 'ChanZong Knowledge Base'],
        url: 'https://chanzong.space/zh-tw',
        description: `收錄${STATS.classics}部禪宗核心典籍，含${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門、${STATS.faqs}條問答。傳承頓悟見性之道。`,
        inLanguage: 'zh-TW',
        publisher: {
          '@id': 'https://chanzong.space/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://chanzong.space/zh-tw/books?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://chanzong.space/#organization',
        name: '禪宗知識庫',
        alternateName: 'ChanZong.space',
        url: 'https://chanzong.space/zh-tw',
        logo: 'https://chanzong.space/logo-nianhua-new.jpg',
        publishingPrinciples: 'https://chanzong.space/zh-tw/about',
        sameAs: [
          'https://github.com/creativeburster/chanzong.space',
          'https://ramanamaharshi.space',
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
