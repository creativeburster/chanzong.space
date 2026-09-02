import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: {
    absolute: '禅宗知识库 | 顿悟见性之道 | ChanZong.space',
  },
  description: `禅宗知识库——收录${STATS.classics}部核心禅宗典籍、${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门、${STATS.faqs}条问答。从达摩四论到无门关、碧岩录，传承顿悟见性之道。`,
  alternates: {
    canonical: '/',
    languages: {
      'zh-Hans': '/',
      'zh-Hant': '/zh-tw',
    },
  },
  openGraph: {
    type: 'website',
    title: '禅宗知识库 | 顿悟见性之道 | ChanZong.space',
    description: `收录${STATS.classics}部禅宗典籍、${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门、${STATS.faqs}条问答。`,
    url: 'https://chanzong.space/',
    locale: 'zh_CN',
    siteName: '禅宗知识库',
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '禅宗知识库',
    alternateName: 'ChanZong.space',
    url: 'https://chanzong.space/',
    description: `收录${STATS.classics}部禅宗核心典籍，含${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门、${STATS.faqs}条问答。传承顿悟见性之道。`,
    inLanguage: 'zh-CN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://chanzong.space/books',
      },
      'query-input': 'required name=search-term-string',
    },
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
