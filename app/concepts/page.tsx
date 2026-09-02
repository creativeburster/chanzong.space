import type { Metadata } from 'next';
import ConceptsPageClient from './ConceptsPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '核心概念',
  description: `禅宗${STATS.concepts}个核心概念详解——佛性、般若、空、不二、顿悟、见性、平常心是道等，涵盖心性、境界、修证、教理四大类，附祖师金句与参修指导。`,
  alternates: {
    canonical: '/concepts',
    languages: {
      'zh-Hans': '/concepts',
      'zh-Hant': '/zh-tw/concepts',
    },
  },
  openGraph: {
    type: 'website',
    title: '核心概念 | 禅宗知识库 ChanZong.space',
    description: `禅宗${STATS.concepts}个核心概念详解，涵盖心性、境界、修证、教理四大类。`,
    url: 'https://chanzong.space/concepts',
  },
};

export default function ConceptsPagePage() {
  return <ConceptsPageClient />;
}
