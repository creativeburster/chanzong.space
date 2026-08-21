import type { Metadata } from 'next';
import SitemapClient from './SitemapClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '站点地图',
  description: `禅宗知识库全站索引——${STATS.classics}部典籍、${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门、${STATS.faqs}条问答的完整页面导航。`,
  alternates: { canonical: '/sitemap' },
  openGraph: {
    type: 'website',
    title: '站点地图 | 禅宗知识库 ChanZong.space',
    description: '禅宗知识库全站内容索引。',
    url: 'https://chanzong.space/sitemap',
  },
};

export default function SitemapPage() {
  return <SitemapClient />;
}
