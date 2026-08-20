import type { Metadata } from 'next';
import FAQPageClient from './FAQPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '经典问答',
  description: '禅宗知识库·问答：传承顿悟见性之道。',
  alternates: { canonical: '/faq' },
  openGraph: {
    type: 'website',
    title: '经典问答',
    description: '禅宗知识库·问答，传承顿悟见性之道。',
    url: 'https://chanzong.space/faq',
  },
};

export default function FAQPagePage() {
  return <FAQPageClient />;
}
