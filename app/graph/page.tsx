import type { Metadata } from 'next';
import GraphClient from './GraphClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '知识图谱 · 经典概念祖师公案全景网络',
  description: `禅宗交互式知识图谱——${STATS.concepts}个核心概念、${STATS.classics}部经典著作、${STATS.persons}位历代祖师、${STATS.koans}则公案与${STATS.methods}种法门的拓扑关联全景图，交互式探索禅宗法脉与知识关联。`,
  alternates: {
    canonical: '/graph',
    languages: {
      'zh-Hans': '/graph',
      'zh-Hant': '/zh-tw/graph',
      'x-default': '/graph',
    },
  },
  openGraph: {
    type: 'website',
    title: '知识图谱 | 禅宗知识库 ChanZong.space',
    description: `${STATS.concepts}个概念、${STATS.classics}部著作、${STATS.persons}位祖师、${STATS.koans}则公案的关联全景图。`,
    url: 'https://chanzong.space/graph',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禅宗知识库 ChanZong.space' }],
  },
};

export default function GraphPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': 'https://chanzong.space/graph#dataset',
    name: '禅宗知识库多维实体拓扑图谱 (ChanZong Knowledge Graph)',
    description: `涵盖${STATS.classics}部禅宗原典、${STATS.concepts}个核心概念、${STATS.koans}则禅门公案、${STATS.persons}位历代祖师与${STATS.methods}种修持法门的双向交叉关联知识网络数据集。`,
    url: 'https://chanzong.space/graph',
    inLanguage: 'zh-CN',
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    creator: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禅宗知识库',
      url: 'https://chanzong.space',
    },
    keywords: ['禅宗知识图谱', '佛教文献图谱', 'CBETA', '禅宗公案', '五家七宗', 'D3.js 知识网络'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GraphClient />
    </>
  );
}
