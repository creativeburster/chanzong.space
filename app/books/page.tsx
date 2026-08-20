import type { Metadata } from 'next';
import BooksClient from './BooksClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '书籍总览',
  description: `全量收录${STATS.classics}部核心禅宗典籍，从七佛传法偈、达摩四论、六祖坛经到中论、万善同归集，含${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门、${STATS.faqs}条问答。`,
  alternates: { canonical: '/books' },
  openGraph: {
    type: 'website',
    title: '书籍总览',
    description: `全量收录${STATS.classics}部核心禅宗典籍。`,
    url: 'https://chanzong.space/books',
  },
};

export default function BooksPage() {
  return <BooksClient />;
}
