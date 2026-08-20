import type { Metadata } from 'next';
import KoansPageClient from './KoansPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '公案',
  description: '禅宗知识库·公案：传承顿悟见性之道。',
  alternates: { canonical: '/koan' },
  openGraph: {
    type: 'website',
    title: '公案',
    description: '禅宗知识库·公案，传承顿悟见性之道。',
    url: 'https://chanzong.space/koan',
  },
};

export default function KoansPagePage() {
  return <KoansPageClient />;
}
