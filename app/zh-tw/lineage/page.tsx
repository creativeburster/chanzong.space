import type { Metadata } from 'next';
import LineageClient from '@/app/lineage/LineageClient';

export const metadata: Metadata = {
  title: '禪宗祖師法脈傳承樹 | 一花開五葉 · 五家七宗世系全圖',
  description: '禪宗知識庫祖師法脈傳承譜系樹——從西天二十八祖、東土六祖到南嶽懷讓、青原行思衍生五家七宗（臨濟、溈仰、曹洞、雲門、法眼、楊岐、黃龍）的完整動態師承譜系樹。',
  alternates: {
    canonical: '/zh-tw/lineage',
    languages: {
      'zh-Hans': '/lineage',
      'zh-Hant': '/zh-tw/lineage',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪宗法脈傳承樹 | 禪宗知識庫 ChanZong.space',
    description: '西天二十八祖 · 東土六祖 · 五家七宗完整交互式法脈源流圖譜。',
    url: 'https://chanzong.space/zh-tw/lineage',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function ZhTwLineagePage() {
  return <LineageClient />;
}
