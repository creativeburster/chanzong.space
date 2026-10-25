import type { Metadata } from 'next';
import SitemapClient from '@/app/sitemap/SitemapClient';
import { STATS } from '@/lib/stats';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { ZEN_CATEGORIES } from '@/lib/categories';
import { ZEN_COLLECTIONS } from '@/lib/collections';
import { convertToTrad } from '@/lib/opencc';

export const metadata: Metadata = {
  title: '網站地圖 · 全站典籍概念公案索引',
  description: `禪宗知識庫全站索引——${STATS.classics}部典籍、11大部類、${STATS.collections}大合集、${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門、${STATS.faqs}條問答的完整頁面導航。`,
  alternates: {
    canonical: '/zh-tw/sitemap',
    languages: {
      'zh-Hans': '/sitemap',
      'zh-Hant': '/zh-tw/sitemap',
      'x-default': '/sitemap',
    },
  },
  openGraph: {
    type: 'website',
    title: '網站地圖 | 禪宗知識庫 ChanZong.space',
    description: '禪宗知識庫全站內容索引。',
    url: 'https://chanzong.space/zh-tw/sitemap',
    locale: 'zh_TW',
    siteName: '禪宗知識庫',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禪宗知識庫 ChanZong.space' }],
  },
};

export default function TradSitemapPage() {
  const categories = ZEN_CATEGORIES.map((c) => ({ id: c.id, title: convertToTrad(c.name), sub: convertToTrad(c.subtitle), href: `/categories/${c.id}` }));
  const collections = ZEN_COLLECTIONS.map((c) => ({ id: c.id, title: convertToTrad(c.title), sub: convertToTrad(c.author), href: `/collections/${c.id}` }));
  const concepts = ZEN_CONCEPTS.map((c) => ({ id: c.id, title: convertToTrad(c.title), sub: convertToTrad(c.category || ''), href: `/concepts/${c.id}` }));
  const methods = ZEN_METHODS.map((m) => ({ id: m.id, title: convertToTrad(m.title), sub: '', href: `/methods/${m.id}` }));
  const koans = ZEN_KOANS.map((k) => ({ id: k.id, title: convertToTrad(k.question), sub: convertToTrad(`${k.master} · ${k.source}`), href: `/koan/${k.id}` }));
  const persons = ZEN_PERSONS.map((p) => ({ id: p.id, title: convertToTrad(p.name), sub: convertToTrad(p.title), href: `/persons/${p.id}` }));
  const faqs = ZEN_FAQS.slice(0, 100).map((f) => ({ id: f.id, title: convertToTrad(f.question), sub: '', href: `/faq#${f.id}` }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/zh-tw/sitemap#sitemap',
    name: '禪宗知識庫全站頁面索引地圖',
    description: `涵蓋${STATS.classics}部典籍、11大部類、${STATS.collections}大合集、${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師與${STATS.methods}種法門的全量靜態 HTML 索引。`,
    url: 'https://chanzong.space/zh-tw/sitemap',
    inLanguage: 'zh-TW',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禪宗知識庫',
      url: 'https://chanzong.space/zh-tw',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SitemapClient
        categories={categories}
        collections={collections}
        concepts={concepts}
        methods={methods}
        koans={koans}
        persons={persons}
        faqs={faqs}
      />
    </>
  );
}
