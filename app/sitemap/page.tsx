import type { Metadata } from 'next';
import SitemapClient from './SitemapClient';
import { STATS } from '@/lib/stats';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: '站点地图',
  description: `禅宗知识库全站索引——${STATS.classics}部典籍、${STATS.concepts}个概念、${STATS.koans}则公案、${STATS.persons}位祖师、${STATS.methods}种法门、${STATS.faqs}条问答的完整页面导航。`,
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
    images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禅宗知识库 ChanZong.space' }],
  },
};

export default function SitemapPage() {
  const concepts = ZEN_CONCEPTS.map((c) => ({ id: c.id, title: c.title, sub: c.category, href: `/concepts/${c.id}` }));
  const methods = ZEN_METHODS.map((m) => ({ id: m.id, title: m.title, sub: '', href: `/methods/${m.id}` }));
  const koans = ZEN_KOANS.map((k) => ({ id: k.id, title: k.question, sub: `${k.master} · ${k.source}`, href: `/koan/${k.id}` }));
  const persons = ZEN_PERSONS.map((p) => ({ id: p.id, title: p.name, sub: p.title, href: `/persons/${p.id}` }));
  const faqs = ZEN_FAQS.slice(0, 100).map((f) => ({ id: f.id, title: f.question, sub: '', href: `/faq#${f.id}` }));

  return (
    <SitemapClient
      concepts={concepts}
      methods={methods}
      koans={koans}
      persons={persons}
      faqs={faqs}
    />
  );
}
