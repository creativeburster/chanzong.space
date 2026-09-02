import type { Metadata } from 'next';
import FAQPageClient from './FAQPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_FAQS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: "禅宗解惑问答 · 2793则深层疑难答疑 | 禅宗知识库",
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
    title: '问答 | 禅宗知识库 ChanZong.space',
    description: `禅宗${STATS.faqs}条问答——公案解读、义理辨析与修证疑问。`,
    url: 'https://chanzong.space/faq',
  },
};

function FAQPageJsonLd() {
  const mainEntity = ZEN_FAQS.slice(0, 20).map(f => ({
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
  return (
    <>
      <FAQPageJsonLd />
      <FAQPageClient />
    </>
  );
}
