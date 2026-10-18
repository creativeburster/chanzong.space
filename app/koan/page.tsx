import type { Metadata } from 'next';
import KoansPageClient from './KoansPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_KOANS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: `禅门公案机锋 · ${STATS.koans}则破关参究`,
  description: `禅宗${STATS.koans}则公案全集——赵州狗子、南泉斩猫、百丈野狐、德山棒临济喝等，古德机锋对决与祖师开悟因缘，附出处与相关经典。`,
  alternates: {
    canonical: '/koan',
    languages: {
      'zh-Hans': '/koan',
      'zh-Hant': '/zh-tw/koan',
      'x-default': '/koan',
    },
  },
  openGraph: {
    type: 'website',
    title: '禅宗公案 | 禅宗知识库 ChanZong.space',
    description: `禅宗${STATS.koans}则公案——古德机锋对决与祖师开悟因缘。`,
    url: 'https://chanzong.space/koan',
  },
};

export default function KoansPagePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/koan#collection',
    name: '禅门公案机锋库',
    description: `禅宗${STATS.koans}则公案全集——古德机锋对决与祖师开悟因缘。`,
    url: 'https://chanzong.space/koan',
    inLanguage: 'zh-CN',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: ZEN_KOANS.length,
      itemListElement: ZEN_KOANS.slice(0, 50).map((k, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: k.question,
        url: `https://chanzong.space/koan/${k.id}`,
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
