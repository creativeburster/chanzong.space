import { NextRequest } from 'next/server';
import { formatUrlsetXml, getKoansEntries } from '@/lib/sitemap-data';

export const dynamic = 'force-static';

export function GET(_req: NextRequest) {
  const xml = formatUrlsetXml(getKoansEntries());
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
