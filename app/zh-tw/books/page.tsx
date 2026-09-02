import type { Metadata } from 'next';
import BooksClient from '@/app/books/BooksClient';
import { STATS } from '@/lib/stats';

export const metadata: Metadata = {
  title: '禪宗典籍藏經閣',
  description: `收錄${STATS.classics}部禪宗核心典籍——從七佛傳法偈、達摩四論、六祖壇經到無門關、碧巖錄、禪關策進，每部含原文、白話翻譯、生僻字注音與公案提取。`,
  alternates: {
    canonical: '/zh-tw/books',
    languages: {
      'zh-Hans': '/books',
      'zh-Hant': '/zh-tw/books',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪宗典籍藏經閣 | 禪宗知識庫 ChanZong.space',
    description: `收錄${STATS.classics}部禪宗核心典籍，含原文、白話翻譯與公案提取。`,
    url: 'https://chanzong.space/zh-tw/books',
    locale: 'zh_TW',
  },
};

export default function TradBooksPage() {
  return <BooksClient />;
}
