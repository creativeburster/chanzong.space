import type { Metadata } from 'next';
import SitemapClient from '@/app/sitemap/SitemapClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '網站地圖',
  description: `禪宗知識庫全站索引——${STATS.classics}部典籍、${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門、${STATS.faqs}條問答的完整頁面導航。`,
  alternates: {
    canonical: '/zh-tw/sitemap',
    languages: {
      'zh-Hans': '/sitemap',
      'zh-Hant': '/zh-tw/sitemap',
    },
  },
  openGraph: {
    type: 'website',
    title: '網站地圖 | 禪宗知識庫 ChanZong.space',
    description: '禪宗知識庫全站內容索引。',
    url: 'https://chanzong.space/zh-tw/sitemap',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradSitemapPage() {
  return <SitemapClient />;
}
