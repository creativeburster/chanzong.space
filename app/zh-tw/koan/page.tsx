import type { Metadata } from 'next';
import KoansPageClient from '@/app/koan/KoansPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_KOANS } from '@/lib/taxonomy';
import { convertToTrad } from '@/lib/opencc';

export const metadata: Metadata = {
  title: `禪門公案機鋒 · ${STATS.koans}則破關參究`,
  description: `禪宗${STATS.koans}則公案全集——趙州狗子、南泉斬貓、百丈野狐、德山棒臨濟喝等，古德機鋒對決與祖師開悟因緣，附出處與相關經典。`,
  alternates: {
    canonical: '/zh-tw/koan',
    languages: {
      'zh-Hans': '/koan',
      'zh-Hant': '/zh-tw/koan',
      'x-default': '/koan',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪宗公案 | 禪宗知識庫 ChanZong.space',
    description: `禪宗${STATS.koans}則公案——古德機鋒對決與祖師開悟因緣。`,
    url: 'https://chanzong.space/zh-tw/koan',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
    images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禪宗知識庫 ChanZong.space' }],
  },
};

export default function TradKoansPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/zh-tw/koan#collection',
    name: '禪門公案機鋒庫',
    description: `禪宗${STATS.koans}則公案全集——古德機鋒對決與祖師開悟因緣。`,
    url: 'https://chanzong.space/zh-tw/koan',
    inLanguage: 'zh-TW',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ZEN_KOANS.length,
      itemListElement: ZEN_KOANS.slice(0, 50).map((k, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: convertToTrad(k.question),
        url: `https://chanzong.space/zh-tw/koan/${k.id}`,
      })),
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KoansPageClient />
    </>
  );
}
