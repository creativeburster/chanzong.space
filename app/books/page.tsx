import type { Metadata } from 'next';
import BooksClient from './BooksClient';
import { STATS } from '@/lib/stats';
import manifest from '@/manifest.json';

export const metadata: Metadata = {
  title: '禅宗典籍藏经阁',
  description: `收录${STATS.classics}部禅宗核心典籍——从七佛传法偈、达摩四论、六祖坛经到无门关、碧岩录、禅关策进，每部含原文、白话翻译、生僻字注音与公案提取。`,
  alternates: {
    canonical: '/books',
    languages: {
      'zh-Hans': '/books',
      'zh-Hant': '/zh-tw/books',
      'x-default': '/books',
    },
  },
  openGraph: {
    type: 'website',
    title: '禅宗典籍藏经阁 | 禅宗知识库 ChanZong.space',
    description: `收录${STATS.classics}部禅宗核心典籍，含原文、白话翻译与公案提取。`,
    url: 'https://chanzong.space/books',
    images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禅宗知识库 ChanZong.space' }],
  },
};

export default function BooksPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/books#collection',
    name: '禅宗典籍藏经阁',
    description: `收录${STATS.classics}部禅宗核心典籍——含原文、白话翻译、生僻字注音与公案提取。`,
    url: 'https://chanzong.space/books',
    inLanguage: 'zh-CN',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: manifest.length,
      itemListElement: manifest.slice(0, 50).map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.title,
        url: `https://chanzong.space/classics/${b.id}`,
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
