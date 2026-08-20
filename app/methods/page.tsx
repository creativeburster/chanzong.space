import type { Metadata } from 'next';
import MethodsPageClient from './MethodsPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '修持法门',
  description: '禅宗知识库·法门：传承顿悟见性之道。',
  alternates: { canonical: '/methods' },
  openGraph: {
    type: 'website',
    title: '修持法门',
    description: '禅宗知识库·法门，传承顿悟见性之道。',
    url: 'https://chanzong.space/methods',
  },
};

export default function MethodsPagePage() {
  return <MethodsPageClient />;
}
