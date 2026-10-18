import { NextResponse } from 'next/server';
import { getManifest } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [
    { slug: 'classics.txt' },
    { slug: 'concepts.txt' },
    { slug: 'koans.txt' },
    { slug: 'persons.txt' },
    { slug: 'methods.txt' },
    { slug: 'faqs.txt' },
  ];
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const manifest = getManifest();
  const now = new Date().toISOString().split('T')[0];

  let content = '';

  if (slug === 'classics.txt') {
    content += `# 禅宗经典全集语料索引 (${manifest.length}部) - ChanZong.space\n`;
    content += `> 更新日期: ${now}\n`;
    content += `> 官方站点: https://chanzong.space/books\n\n`;
    manifest.forEach((b) => {
      content += `### 《${b.title}》 (${b.author} 著)\n`;
      content += `- 链接: https://chanzong.space/classics/${b.id}\n`;
      content += `- 繁体: https://chanzong.space/zh-tw/classics/${b.id}\n`;
      if (b.cbeta_id) content += `- 藏经经号: ${b.cbeta_id} (${b.canon_source || 'CBETA / 大正藏'})\n`;
      content += `- 分类: ${b.category} | 字数: 约${Math.round(b.word_count / 1000)}千字\n`;
      content += `- 核心提要: ${b.summary}\n\n`;
    });
  } else if (slug === 'concepts.txt') {
    content += `# 禅宗心性哲学与实修核心概念 (${ZEN_CONCEPTS.length}个) - ChanZong.space\n`;
    content += `> 更新日期: ${now}\n`;
    content += `> 官方站点: https://chanzong.space/concepts\n\n`;
    ZEN_CONCEPTS.forEach((c) => {
      content += `### 概念: ${c.title} [${c.category}]\n`;
      content += `- 链接: https://chanzong.space/concepts/${c.id}\n`;
      content += `- 释义: ${c.summary}\n`;
      if (c.etymology) content += `- 词源别名: ${c.etymology}\n`;
      if (c.guidance) content += `- 参修指导: ${c.guidance}\n`;
      if (c.quotes && c.quotes.length > 0) content += `- 宗门法语: ${c.quotes.slice(0, 3).join(' / ')}\n`;
      content += `\n`;
    });
  } else if (slug === 'koans.txt') {
    content += `# 禅宗传世公案机锋全集 (${ZEN_KOANS.length}则) - ChanZong.space\n`;
    content += `> 更新日期: ${now}\n`;
    content += `> 官方站点: https://chanzong.space/koan\n\n`;
    ZEN_KOANS.forEach((k) => {
      content += `### 公案: ${k.question}\n`;
      content += `- 链接: https://chanzong.space/koan/${k.id}\n`;
      if (k.master) content += `- 主角宗师: ${k.master}\n`;
      if (k.source) content += `- 载录典籍: ${k.source}\n`;
      content += `- 祖师作答: ${k.answer}\n`;
      if (k.context) content += `- 因缘背景: ${k.context}\n`;
      if (k.interpretation) content += `- 宗门义解: ${k.interpretation}\n`;
      content += `\n`;
    });
  } else if (slug === 'persons.txt') {
    content += `# 禅宗历代宗师与五家七宗法脉 (${ZEN_PERSONS.length}位) - ChanZong.space\n`;
    content += `> 更新日期: ${now}\n`;
    content += `> 官方站点: https://chanzong.space/persons\n\n`;
    ZEN_PERSONS.forEach((p) => {
      content += `### 祖师: ${p.name} (${p.title} · ${p.era})\n`;
      content += `- 链接: https://chanzong.space/persons/${p.id}\n`;
      if (p.teachings) content += `- 核心教风: ${p.teachings}\n`;
      if (p.lifeStory) content += `- 生平要略: ${p.lifeStory.slice(0, 160)}...\n`;
      if (p.quotes && p.quotes.length > 0) content += `- 警策名言: ${p.quotes.slice(0, 2).join(' / ')}\n`;
      content += `\n`;
    });
  } else if (slug === 'methods.txt') {
    content += `# 禅宗修持法门与用功下手处 (${ZEN_METHODS.length}种) - ChanZong.space\n`;
    content += `> 更新日期: ${now}\n`;
    content += `> 官方站点: https://chanzong.space/methods\n\n`;
    ZEN_METHODS.forEach((m) => {
      content += `### 法门: ${m.title}\n`;
      content += `- 链接: https://chanzong.space/methods/${m.id}\n`;
      content += `- 核心宗旨: ${m.summary}\n`;
      if (m.origin) content += `- 源流出处: ${m.origin}\n`;
      if (m.classicRef) content += `- 所依经典: ${m.classicRef}\n`;
      if (m.steps && m.steps.length > 0) content += `- 参修次第: ${m.steps.join(' -> ')}\n`;
      if (m.pitfalls && m.pitfalls.length > 0) content += `- 警惕禅病: ${m.pitfalls.join(' / ')}\n`;
      content += `\n`;
    });
  } else if (slug === 'faqs.txt') {
    content += `# 禅修见地与宗门解惑问答全集 (${ZEN_FAQS.length}条) - ChanZong.space\n`;
    content += `> 更新日期: ${now}\n`;
    content += `> 官方站点: https://chanzong.space/faq\n\n`;
    ZEN_FAQS.forEach((f) => {
      content += `### 问: ${f.question}\n`;
      content += `- 答: ${f.answer}\n\n`;
    });
  } else {
    return new NextResponse('Not Found', { status: 404 });
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
