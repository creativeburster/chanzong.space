import { NextRequest } from 'next/server';
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';

export const dynamic = 'force-static';

export function GET(_req: NextRequest) {
  const base = 'https://chanzong.space';
  const now = new Date().toISOString();

  const urls: { loc: string; lastmod: string; changefreq: string; priority: number }[] = [];

  // Static pages
  const staticPages = [
    { path: '/', freq: 'weekly', prio: 1.0 },
    { path: '/books', freq: 'weekly', prio: 0.95 },
    { path: '/concepts', freq: 'monthly', prio: 0.9 },
    { path: '/methods', freq: 'monthly', prio: 0.9 },
    { path: '/koan', freq: 'monthly', prio: 0.9 },
    { path: '/persons', freq: 'monthly', prio: 0.9 },
    { path: '/faq', freq: 'monthly', prio: 0.8 },
    { path: '/graph', freq: 'yearly', prio: 0.5 },
    { path: '/sitemap', freq: 'monthly', prio: 0.3 },
  ];
  for (const p of staticPages) {
    urls.push({ loc: `${base}${p.path}`, lastmod: now, changefreq: p.freq, priority: p.prio });
  }

  // Classics
  for (const m of manifest) {
    urls.push({ loc: `${base}/classics/${m.id}`, lastmod: now, changefreq: 'yearly', priority: 0.9 });
  }

  // Concepts
  for (const c of ZEN_CONCEPTS) {
    urls.push({ loc: `${base}/concepts/${c.id}`, lastmod: now, changefreq: 'yearly', priority: 0.8 });
  }

  // Methods
  for (const m of ZEN_METHODS) {
    urls.push({ loc: `${base}/methods/${m.id}`, lastmod: now, changefreq: 'yearly', priority: 0.8 });
  }

  // Koans
  for (const k of ZEN_KOANS) {
    urls.push({ loc: `${base}/koan/${k.id}`, lastmod: now, changefreq: 'yearly', priority: 0.7 });
  }

  // Persons
  for (const p of ZEN_PERSONS) {
    urls.push({ loc: `${base}/persons/${p.id}`, lastmod: now, changefreq: 'yearly', priority: 0.8 });
  }

  // FAQs 不逐条收录: FAQ 页为单页交互渲染(分页加载), 锚点条目不可直接定位, 已由 staticPages 中的 /faq 覆盖

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
