import type { Metadata } from 'next';
import LineageClient from '@/app/lineage/LineageClient';
import { ZEN_PERSONS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

export const metadata: Metadata = {
  title: '禪宗祖師法脈傳承樹 | 一花開五葉 · 五家七宗世系全圖',
  description: '禪宗知識庫祖師法脈傳承譜系樹——從西天二十八祖、東土六祖到南嶽懷讓、青原行思衍生五家七宗（臨濟、溈仰、曹洞、雲門、法眼、楊岐、黃龍）的完整動態師承譜系樹。',
  alternates: {
    canonical: '/zh-tw/lineage',
    languages: {
      'zh-Hans': '/lineage',
      'zh-Hant': '/zh-tw/lineage',
      'x-default': '/lineage',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪宗法脈傳承樹 | 禪宗知識庫 ChanZong.space',
    description: '西天二十八祖 · 東土六祖 · 五家七宗完整交互式法脈源流圖譜。',
    url: 'https://chanzong.space/zh-tw/lineage',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禪宗知識庫 ChanZong.space' }],
  },
};

export default function ZhTwLineagePage() {
  const personsList = ZEN_PERSONS.map((p) => ({
    id: p.id,
    name: convertToTrad(p.name),
    title: convertToTrad(p.title),
    era: convertToTrad(p.era),
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/zh-tw/lineage#lineage',
    name: '禪宗祖師法脈傳承譜系樹（西天二十八祖 · 東土六祖 · 五家七宗）',
    description: '從釋迦牟尼佛、摩訶迦葉、菩提達摩、六祖惠能直至南嶽懷讓、青原行思下五家七宗（臨濟、溈仰、曹洞、雲門、法眼、楊岐、黃龍）的完整師承法脈世系圖。',
    url: 'https://chanzong.space/zh-tw/lineage',
    inLanguage: 'zh-TW',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禪宗知識庫',
      url: 'https://chanzong.space/zh-tw',
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
