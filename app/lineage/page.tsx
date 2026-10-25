import type { Metadata } from 'next';
import LineageClient from './LineageClient';
import { ZEN_PERSONS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: '禅宗祖师法脉传承树 | 一花开五叶 · 五家七宗世系全图',
  description: '禅宗知识库祖师法脉传承谱系树——从西天二十八祖、东土六祖到南岳怀让、青原行思衍生五家七宗（临济、沩仰、曹洞、云门、法眼、杨岐、黄龙）的完整动态师承谱系树。',
  alternates: {
    canonical: '/lineage',
    languages: {
      'zh-Hans': '/lineage',
      'zh-Hant': '/zh-tw/lineage',
      'x-default': '/lineage',
    },
  },
  openGraph: {
    type: 'website',
    title: '禅宗法脉传承树 | 禅宗知识库 ChanZong.space',
    description: '西天二十八祖 · 东土六祖 · 五家七宗完整交互式法脉源流图谱。',
    url: 'https://chanzong.space/lineage',
    locale: 'zh_CN',
    siteName: '禅宗知识库',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禅宗知识库 ChanZong.space' }],
  },
};

export default function LineagePage() {
  const personsList = ZEN_PERSONS.map((p) => ({
    id: p.id,
    name: p.name,
    title: p.title,
    era: p.era,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/lineage#lineage',
    name: '禅宗祖师法脉传承谱系树（西天二十八祖 · 东土六祖 · 五家七宗）',
    description: '从释迦牟尼佛、摩诃迦叶、菩提达摩、六祖惠能直至南岳怀让、青原行思下五家七宗（临济、沩仰、曹洞、云门、法眼、杨岐、黄龙）的完整师承法脉世系图。',
    url: 'https://chanzong.space/lineage',
    inLanguage: 'zh-CN',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禅宗知识库',
      url: 'https://chanzong.space',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LineageClient personsList={personsList} />
    </>
  );
}
