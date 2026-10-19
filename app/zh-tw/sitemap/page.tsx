import type { Metadata } from 'next';
import SitemapClient from '@/app/sitemap/SitemapClient';
import { STATS } from '@/lib/stats';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

export const metadata: Metadata = {
  title: '網站地圖',
  description: `禪宗知識庫全站索引——${STATS.classics}部典籍、${STATS.concepts}個概念、${STATS.koans}則公案、${STATS.persons}位祖師、${STATS.methods}種法門、${STATS.faqs}條問答的完整頁面導航。`,
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
    images: [{ url: '/logo-nianhua-new.jpg', width: 512, height: 512, alt: '禪宗知識庫 ChanZong.space' }],
  },
};

export default function TradSitemapPage() {
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
