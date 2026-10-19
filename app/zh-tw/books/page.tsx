import type { Metadata } from 'next';
import BooksClient from '@/app/books/BooksClient';
import { STATS } from '@/lib/stats';
import manifest from '@/manifest.json';
import { convertToTrad } from '@/lib/opencc';

export const metadata: Metadata = {
  title: '禪宗典籍藏經閣',
  description: `收錄${STATS.classics}部禪宗核心典籍——從七佛傳法偈、達摩四論、六祖壇經到無門關、碧巖錄、禪關策進，每部含原文、白話翻譯、生僻字注音與公案提取。`,
  alternates: {
    canonical: '/zh-tw/books',
    languages: {
      'zh-Hans': '/books',
      'zh-Hant': '/zh-tw/books',
      'x-default': '/books',
    },
  },
  openGraph: {
    type: 'website',
    title: '禪宗典籍藏經閣 | 禪宗知識庫 ChanZong.space',
    description: `收錄${STATS.classics}部禪宗核心典籍，含原文、白話翻譯與公案提取。`,
    url: 'https://chanzong.space/zh-tw/books',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
    images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禪宗知識庫 ChanZong.space' }],
  },
};

export default function TradBooksPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/zh-tw/books#collection',
    name: '禪宗典籍藏經閣',
    description: `收錄${STATS.classics}部禪宗核心典籍——含原文、白話翻譯、生僻字注音與公案提取。`,
    url: 'https://chanzong.space/zh-tw/books',
    inLanguage: 'zh-TW',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: manifest.length,
      itemListElement: manifest.slice(0, 50).map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: convertToTrad(b.title),
        url: `https://chanzong.space/zh-tw/classics/${b.id}`,
      })),
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BooksClient />
    </>
  );
}
