import type { Metadata } from 'next';
import FAQPageClient from '@/app/faq/FAQPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_FAQS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: '問答',
  description: `禪宗${STATS.faqs}條問答——公案解讀、義理辨析、修證疑問，覆蓋禪宗核心議題與常見疑惑。`,
  alternates: {
    canonical: '/zh-tw/faq',
    languages: {
      'zh-Hans': '/faq',
      'zh-Hant': '/zh-tw/faq',
    },
  },
  openGraph: {
    type: 'website',
    title: '問答 | 禪宗知識庫 ChanZong.space',
    description: `禪宗${STATS.faqs}條問答——公案解讀、義理辨析與修證疑問。`,
    url: 'https://chanzong.space/zh-tw/faq',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

export default function TradFAQPage() {
  return <FAQPageClient />;
}
