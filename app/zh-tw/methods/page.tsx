import type { Metadata } from 'next';
import MethodsPageClient from '@/app/methods/MethodsPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '修持法門',
  description: `禪宗${STATS.methods}種修持法門——念佛禪、棒喝、機鋒、看話頭、默照禪、坐禪儀等，禪門實修方便與用功方法詳解。`,
  alternates: {
    canonical: '/zh-tw/methods',
    languages: {
      'zh-Hans': '/methods',
      'zh-Hant': '/zh-tw/methods',
    },
  },
  openGraph: {
    type: 'website',
    title: '修持法門 | 禪宗知識庫 ChanZong.space',
    description: `禪宗${STATS.methods}種修持法門——禪門實修方便與用功方法詳解。`,
    url: 'https://chanzong.space/zh-tw/methods',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradMethodsPage() {
  return <MethodsPageClient />;
}
