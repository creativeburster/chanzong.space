import { NextRequest } from 'next/server';
import { SITE_BASE } from '@/lib/sitemap-data';

export const dynamic = 'force-static';

export function GET(_req: NextRequest) {
  const now = new Date().toISOString();

  const subSitemaps = [
    { path: '/sitemaps/classics.xml' },
    { path: '/sitemaps/concepts.xml' },
    { path: '/sitemaps/koans.xml' },
    { path: '/sitemaps/persons.xml' },
    { path: '/sitemaps/methods.xml' },
    { path: '/sitemaps/collections.xml' },
    { path: '/sitemaps/static.xml' },
  ];

  const sitemapNodes = subSitemaps
    .map(
      (s) => `  <sitemap>
    <loc>${SITE_BASE}${s.path}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapNodes}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
