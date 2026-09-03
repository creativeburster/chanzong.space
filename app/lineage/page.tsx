import type { Metadata } from 'next';
import LineageClient from './LineageClient';

export const metadata: Metadata = {
  title: '禅宗祖师法脉传承树 | 一花开五叶 · 五家七宗世系全图',
  description: '禅宗知识库祖师法脉传承谱系树——从西天二十八祖、东土六祖到南岳怀让、青原行思衍生五家七宗（临济、沩仰、曹洞、云门、法眼、杨岐、黄龙）的完整动态师承谱系树。',
  alternates: {
    canonical: '/lineage',
    languages: {
      'zh-Hans': '/lineage',
      'zh-Hant': '/zh-tw/lineage',
    },
  },
  openGraph: {
    type: 'website',
    title: '禅宗法脉传承树 | 禅宗知识库 ChanZong.space',
    description: '西天二十八祖 · 东土六祖 · 五家七宗完整交互式法脉源流图谱。',
    url: 'https://chanzong.space/lineage',
    locale: 'zh_CN',
    siteName: '禅宗知识库',
  },
};

export default function LineagePage() {
  return <LineageClient />;
}
