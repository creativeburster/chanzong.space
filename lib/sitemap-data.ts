import manifest from '@/manifest.json';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';
import { ZEN_COLLECTIONS } from '@/lib/collections';
import { ZEN_CATEGORIES } from '@/lib/categories';

export const SITE_BASE = 'https://chanzong.space';

export interface SitemapEntry {
  simpPath: string;
  tradPath: string;
  freq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  prio: number;
}

export function formatUrlsetXml(entries: SitemapEntry[]): string {
  const now = new Date().toISOString();
  const urlNodes: string[] = [];

  for (const e of entries) {
    const simpUrl = `${SITE_BASE}${e.simpPath}`;
    const tradUrl = `${SITE_BASE}${e.tradPath}`;

    // 简体 URL 节点
    urlNodes.push(`  <url>
    <loc>${simpUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${e.freq}</changefreq>
    <priority>${e.prio.toFixed(1)}</priority>
    <xhtml:link rel="alternate" hreflang="zh-Hans" href="${simpUrl}" />
    <xhtml:link rel="alternate" hreflang="zh-Hant" href="${tradUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${simpUrl}" />
  </url>`);

    // 繁体 URL 节点
    urlNodes.push(`  <url>
    <loc>${tradUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${e.freq}</changefreq>
    <priority>${(Math.max(0.1, e.prio - 0.05)).toFixed(1)}</priority>
    <xhtml:link rel="alternate" hreflang="zh-Hans" href="${simpUrl}" />
    <xhtml:link rel="alternate" hreflang="zh-Hant" href="${tradUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${simpUrl}" />
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlNodes.join('\n')}
</urlset>`;
}

export function getClassicsEntries(): SitemapEntry[] {
  return manifest.map((m) => ({
    simpPath: `/classics/${m.id}`,
    tradPath: `/zh-tw/classics/${m.id}`,
    freq: 'yearly',
    prio: 0.9,
  }));
}

export function getConceptsEntries(): SitemapEntry[] {
  return ZEN_CONCEPTS.map((c) => ({
    simpPath: `/concepts/${c.id}`,
    tradPath: `/zh-tw/concepts/${c.id}`,
    freq: 'yearly',
    prio: 0.8,
  }));
}

export function getKoansEntries(): SitemapEntry[] {
  return ZEN_KOANS.map((k) => ({
    simpPath: `/koan/${k.id}`,
    tradPath: `/zh-tw/koan/${k.id}`,
    freq: 'yearly',
    prio: 0.75,
  }));
}

export function getPersonsEntries(): SitemapEntry[] {
  return ZEN_PERSONS.map((p) => ({
    simpPath: `/persons/${p.id}`,
    tradPath: `/zh-tw/persons/${p.id}`,
    freq: 'yearly',
    prio: 0.8,
  }));
}

export function getMethodsEntries(): SitemapEntry[] {
  return ZEN_METHODS.map((m) => ({
    simpPath: `/methods/${m.id}`,
    tradPath: `/zh-tw/methods/${m.id}`,
    freq: 'yearly',
    prio: 0.8,
  }));
}

export function getCollectionsEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  for (const col of ZEN_COLLECTIONS) {
    entries.push({
      simpPath: `/collections/${col.id}`,
      tradPath: `/zh-tw/collections/${col.id}`,
      freq: 'monthly',
      prio: 0.85,
    });
  }
  for (const cat of ZEN_CATEGORIES) {
    entries.push({
      simpPath: `/categories/${cat.id}`,
      tradPath: `/zh-tw/categories/${cat.id}`,
      freq: 'monthly',
      prio: 0.9,
    });
  }
  return entries;
}

export function getStaticEntries(): SitemapEntry[] {
  const pages: { path: string; freq: 'weekly' | 'monthly' | 'yearly'; prio: number }[] = [
    { path: '/', freq: 'weekly', prio: 1.0 },
    { path: '/books', freq: 'weekly', prio: 0.95 },
    { path: '/categories', freq: 'weekly', prio: 0.95 },
    { path: '/collections', freq: 'weekly', prio: 0.95 },
    { path: '/concepts', freq: 'monthly', prio: 0.9 },
    { path: '/methods', freq: 'monthly', prio: 0.9 },
    { path: '/koan', freq: 'monthly', prio: 0.9 },
    { path: '/persons', freq: 'monthly', prio: 0.9 },
    { path: '/lineage', freq: 'monthly', prio: 0.9 },
    { path: '/faq', freq: 'monthly', prio: 0.8 },
    { path: '/practice', freq: 'weekly', prio: 0.85 },
    { path: '/graph', freq: 'yearly', prio: 0.5 },
    { path: '/about', freq: 'yearly', prio: 0.5 },
    { path: '/sitemap', freq: 'monthly', prio: 0.3 },
  ];
  return pages.map((p) => ({
    simpPath: p.path,
    tradPath: p.path === '/' ? '/zh-tw' : `/zh-tw${p.path}`,
    freq: p.freq,
    prio: p.prio,
  }));
}
