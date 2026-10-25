import type { Metadata } from 'next';
import SitemapClient from './SitemapClient';
import { STATS } from '@/lib/stats';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { ZEN_CATEGORIES } from '@/lib/categories';
import { ZEN_COLLECTIONS } from '@/lib/collections';

export const metadata: Metadata = {
  title: '站点地图 · 全站典籍概念公案索引',
  description: `禅宗知识库全站索引——${STATS.classics}部典籍、11大部类、${STATS.collections}大合集、${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门、${STATS.faqs}条问答的完整页面导航。`,
  alternates: {
    canonical: '/sitemap',
    languages: {
      'zh-Hans': '/sitemap',
      'zh-Hant': '/zh-tw/sitemap',
      'x-default': '/sitemap',
    },
  },
  openGraph: {
    type: 'website',
    title: '站点地图 | 禅宗知识库 ChanZong.space',
    description: '禅宗知识库全站内容索引。',
    url: 'https://chanzong.space/sitemap',
    images: [{ url: '/og-banner.jpg', width: 1200, height: 630, alt: '禅宗知识库 ChanZong.space' }],
  },
};

export default function SitemapPage() {
  const categories = ZEN_CATEGORIES.map((c) => ({ id: c.id, title: c.name, sub: c.subtitle, href: `/categories/${c.id}` }));
  const collections = ZEN_COLLECTIONS.map((c) => ({ id: c.id, title: c.title, sub: c.author, href: `/collections/${c.id}` }));
  const concepts = ZEN_CONCEPTS.map((c) => ({ id: c.id, title: c.title, sub: c.category, href: `/concepts/${c.id}` }));
  const methods = ZEN_METHODS.map((m) => ({ id: m.id, title: m.title, sub: '', href: `/methods/${m.id}` }));
  const koans = ZEN_KOANS.map((k) => ({ id: k.id, title: k.question, sub: `${k.master} · ${k.source}`, href: `/koan/${k.id}` }));
  const persons = ZEN_PERSONS.map((p) => ({ id: p.id, title: p.name, sub: p.title, href: `/persons/${p.id}` }));
  const faqs = ZEN_FAQS.slice(0, 100).map((f) => ({ id: f.id, title: f.question, sub: '', href: `/faq#${f.id}` }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://chanzong.space/sitemap#sitemap',
    name: '禅宗知识库全站页面索引地图',
    description: `涵盖${STATS.classics}部典籍、11大部类、${STATS.collections}大合集、${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师与${STATS.methods}种法门的全量静态 HTML 索引。`,
    url: 'https://chanzong.space/sitemap',
    inLanguage: 'zh-CN',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://chanzong.space/#organization',
      name: '禅宗知识库',
      url: 'https://chanzong.space',
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
