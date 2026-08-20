import type { Metadata } from 'next';
import FAQPageClient from './FAQPageClient';
import { STATS } from '@/lib/stats';
import { ZEN_FAQS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: '经典问答',
  description: `禅宗知识库·问答：传承顿悟见性之道，含${STATS.faqs}条经典问答。`,
  alternates: { canonical: '/faq' },
  openGraph: {
    type: 'website',
    title: '经典问答',
    description: '禅宗知识库·问答，传承顿悟见性之道。',
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
