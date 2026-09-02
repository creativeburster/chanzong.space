import type { Metadata } from 'next';
import ConceptsPageClient from '@/app/concepts/ConceptsPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '核心概念',
  description: `禪宗${STATS.concepts}個核心概念詳解——佛性、般若、空、不二、頓悟、見性、平常心是道等，涵蓋心性、境界、修證、教理四大類，附祖師金句與參修指導。`,
  alternates: {
    canonical: '/zh-tw/concepts',
    languages: {
      'zh-Hans': '/concepts',
      'zh-Hant': '/zh-tw/concepts',
    },
  },
  openGraph: {
    type: 'website',
    title: '核心概念 | 禪宗知識庫 ChanZong.space',
    description: `禪宗${STATS.concepts}個核心概念詳解，涵蓋心性、境界、修證、教理四大類。`,
    url: 'https://chanzong.space/zh-tw/concepts',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradConceptsPage() {
  return <ConceptsPageClient />;
}
