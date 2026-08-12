import { MetadataRoute } from 'next';
import manifest from '@/manifest.json';
import { ZEN_CONCEPTS, ZEN_PERSONS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://chanzong.space';
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/books`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${base}/concepts`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/methods`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/koan`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/persons`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/graph`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const classicPages: MetadataRoute.Sitemap = manifest.map((item) => ({
    url: `${base}/classics/${item.id}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.9,
  }));

  const conceptPages: MetadataRoute.Sitemap = ZEN_CONCEPTS.map((c) => ({
    url: `${base}/concepts/${c.id}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.8,
  }));

  const personPages: MetadataRoute.Sitemap = ZEN_PERSONS.map((p) => ({
    url: `${base}/persons/${p.id}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.8,
  }));

  const methodPages: MetadataRoute.Sitemap = ZEN_METHODS.map((m) => ({
    url: `${base}/methods/${m.id}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.8,
  }));

  const koanPages: MetadataRoute.Sitemap = ZEN_KOANS.map((k) => ({
    url: `${base}/koan/${k.id}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  const faqPages: MetadataRoute.Sitemap = ZEN_FAQS.map((f) => ({
    url: `${base}/faq#${f.id}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...classicPages, ...conceptPages, ...personPages, ...methodPages, ...koanPages, ...faqPages];
}