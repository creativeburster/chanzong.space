import type { Metadata } from 'next';
import FAQPageClient from '@/app/faq/FAQPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_FAQS } from '@/lib/taxonomy/faqs';
import { convertToTrad } from '@/lib/opencc';

export const metadata: Metadata = {
  title: `禪宗解惑問答 · ${STATS.faqs}則深層疑難答疑 | 禪宗知識庫`,
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
    title: `問答 · ${STATS.faqs}則宗門解惑 | 禪宗知識庫 ChanZong.space`,
    description: `禪宗${STATS.faqs}條問答——公案解讀、義理辨析與修證疑問。`,
    url: 'https://chanzong.space/zh-tw/faq',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
  },
};

// 結構化數據：取前 50 條問答（與首屏直出 50 條 details 嚴格一致）
function FAQPageJsonLd() {
  const mainEntity = ZEN_FAQS.slice(0, 50).map(f => ({
    '@type': 'Question',
    name: convertToTrad(f.question),
    acceptedAnswer: {
      '@type': 'Answer',
      text: convertToTrad(f.answer),
    },
  }));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'zh-TW',
    mainEntity,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function TradFAQPage() {
  return (
    <>
      <FAQPageJsonLd />
      <FAQPageClient />
    </>
  );
}
