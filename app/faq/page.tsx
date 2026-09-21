import type { Metadata } from 'next';
import FAQPageClient from './FAQPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_FAQS } from '@/lib/taxonomy/faqs';

export const metadata: Metadata = {
  title: `禅宗解惑问答 · ${STATS.faqs}则深层疑难答疑 | 禅宗知识库`,
  description: `禅宗${STATS.faqs}条问答——公案解读、义理辨析、修证疑问，覆盖禅宗核心议题与常见疑惑。`,
  alternates: {
    canonical: '/faq',
    languages: {
      'zh-Hans': '/faq',
      'zh-Hant': '/zh-tw/faq',
    },
  },
  openGraph: {
    type: 'website',
    title: `问答 · ${STATS.faqs}则宗门解惑 | 禅宗知识库 ChanZong.space`,
    description: `禅宗${STATS.faqs}条问答——公案解读、义理辨析与修证疑问。`,
    url: 'https://chanzong.space/faq',
  },
};

function FAQPageJsonLd() {
  // 结构化数据：取前 50 条问答（与首屏直出 50 条 details 严格一致）
  const mainEntity = ZEN_FAQS.slice(0, 50).map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.answer,
    },
  }));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function FAQPagePage() {
  const initialFaqs = ZEN_FAQS.slice(0, 50);
  return (
    <>
      <FAQPageJsonLd />
      <FAQPageClient initialFaqs={initialFaqs} totalFaqCount={ZEN_FAQS.length} />
    </>
  );
}
