import { NextRequest } from 'next/server';
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';
import { ZEN_COLLECTIONS } from '@/lib/collections';

export const dynamic = 'force-static';

export function GET(_req: NextRequest) {
  const base = 'https://chanzong.space';
  const now = new Date().toISOString();

  type Entry = { simpPath: string; tradPath: string; freq: string; prio: number };
  const entries: Entry[] = [];

  // Static pages
  const staticPages = [
    { path: '/', freq: 'weekly', prio: 1.0 },
    { path: '/books', freq: 'weekly', prio: 0.95 },
    { path: '/concepts', freq: 'monthly', prio: 0.9 },
    { path: '/methods', freq: 'monthly', prio: 0.9 },
    { path: '/koan', freq: 'monthly', prio: 0.9 },
    { path: '/persons', freq: 'monthly', prio: 0.9 },
    { path: '/faq', freq: 'monthly', prio: 0.8 },
    { path: '/practice', freq: 'weekly', prio: 0.85 },
    { path: '/graph', freq: 'yearly', prio: 0.5 },
    { path: '/about', freq: 'yearly', prio: 0.4 },
    { path: '/sitemap', freq: 'monthly', prio: 0.3 },
  ];
  for (const p of staticPages) {
    entries.push({
      simpPath: p.path,
      tradPath: p.path === '/' ? '/zh-tw' : `/zh-tw${p.path}`,
      freq: p.freq,
      prio: p.prio,
    });
  }

  // Classics (150 部)
  for (const m of manifest) {
    entries.push({
      simpPath: `/classics/${m.id}`,
      tradPath: `/zh-tw/classics/${m.id}`,
      freq: 'yearly',
      prio: 0.9,
    });
  }

  // Concepts (499 个)
  for (const c of ZEN_CONCEPTS) {
    entries.push({
      simpPath: `/concepts/${c.id}`,
      tradPath: `/zh-tw/concepts/${c.id}`,
      freq: 'yearly',
      prio: 0.8,
    });
  }

  // Methods (121 种)
  for (const m of ZEN_METHODS) {
    entries.push({
      simpPath: `/methods/${m.id}`,
      tradPath: `/zh-tw/methods/${m.id}`,
      freq: 'yearly',
      prio: 0.8,
    });
  }

  // Koans (661 则)
  for (const k of ZEN_KOANS) {
    entries.push({
      simpPath: `/koan/${k.id}`,
      tradPath: `/zh-tw/koan/${k.id}`,
      freq: 'yearly',
      prio: 0.75,
    });
  }

  // Persons (229 位)
  for (const p of ZEN_PERSONS) {
    entries.push({
      simpPath: `/persons/${p.id}`,
      tradPath: `/zh-tw/persons/${p.id}`,
      freq: 'yearly',
      prio: 0.8,
    });
  }

  // Collections (专题合集)
  for (const col of ZEN_COLLECTIONS) {
    entries.push({
      simpPath: `/collections/${col.id}`,
      tradPath: `/zh-tw/collections/${col.id}`,
      freq: 'monthly',
      prio: 0.85,
    });
  }

  // 生成全量简体与繁体双轨 URL 节点（带 hreflang）
  const urlNodes: string[] = [];
  for (const e of entries) {
    const simpUrl = `${base}${e.simpPath}`;
    const tradUrl = `${base}${e.tradPath}`;

    // 简体 URL 节点
    urlNodes.push(`  <url>
    <loc>${simpUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${e.freq}</changefreq>
    <priority>${e.prio.toFixed(1)}</priority>
    <xhtml:link rel="alternate" hreflang="zh-Hans" href="${simpUrl}" />
    <xhtml:link rel="alternate" hreflang="zh-Hant" href="${tradUrl}" />
  </url>`);

    // 繁体 URL 节点
    urlNodes.push(`  <url>
    <loc>${tradUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${e.freq}</changefreq>
    <priority>${(Math.max(0.1, e.prio - 0.05)).toFixed(1)}</priority>
    <xhtml:link rel="alternate" hreflang="zh-Hans" href="${simpUrl}" />
    <xhtml:link rel="alternate" hreflang="zh-Hant" href="${tradUrl}" />
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlNodes.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
