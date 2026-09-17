import type { Metadata } from 'next';
import { STATS } from '@/lib/stats';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: '关于本站',
  description: `禅宗知识库（chanzong.space）的编辑原则、文本来源、版权声明与联系方式。本站收录${STATS.classics}部禅宗核心典籍，文本源自CBETA电子佛典集成与大正藏，经人工校对与白话翻译。`,
  alternates: {
    canonical: '/about',
    languages: {
      'zh-Hans': '/about',
      'zh-Hant': '/zh-tw/about',
    },
  },
  openGraph: {
    type: 'website',
    title: '关于本站 | 禅宗知识库 ChanZong.space',
    description: '禅宗知识库的编辑原则、文本来源与版权声明。',
    url: 'https://chanzong.space/about',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
