import type { Metadata } from 'next';
import MethodsPageClient from './MethodsPageClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '修持法门',
  description: `禅宗${STATS.methods}种修持法门——念佛禅、棒喝、机锋、看话头、默照禅、坐禅仪等，禅门实修方便与用功方法详解。`,
  alternates: { canonical: '/methods' },
  openGraph: {
    type: 'website',
    title: '修持法门 | 禅宗知识库 ChanZong.space',
    description: `禅宗${STATS.methods}种修持法门——禅门实修方便与用功方法详解。`,
    url: 'https://chanzong.space/methods',
  },
};

export default function MethodsPagePage() {
  return <MethodsPageClient />;
}
