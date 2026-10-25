import { NextResponse } from 'next/server';
import { getManifest } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { ZEN_CATEGORIES } from '@/lib/categories';
import { ZEN_COLLECTIONS } from '@/lib/collections';
import { ZEN_LINEAGE_TREE, LineageNode } from '@/lib/lineageData';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [
    { slug: 'classics.txt' },
    { slug: 'collections.txt' },
    { slug: 'concepts.txt' },
    { slug: 'koans.txt' },
    { slug: 'persons.txt' },
    { slug: 'lineage.txt' },
    { slug: 'methods.txt' },
    { slug: 'faqs.txt' },
  ];
}

function renderLineageTree(node: LineageNode, depth = 0): string {
  const indent = '  '.repeat(depth);
  const urlPart = node.personId ? ` (https://chanzong.space/persons/${node.personId})` : '';
  let out = `${indent}- **${node.name}** [${node.title} · ${node.era}]${urlPart}: ${node.summary}\n`;
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      out += renderLineageTree(child, depth + 1);
    }
  }
  return out;
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
      const wordStr = b.word_count >= 1000 ? `约${Math.round(b.word_count / 1000)}千字` : `${b.word_count}字`;
      content += `### 《${b.title}》 (${b.author} 著)\n`;
      content += `- 链接: https://chanzong.space/classics/${b.id}\n`;
      content += `- 繁体: https://chanzong.space/zh-tw/classics/${b.id}\n`;
      if (b.cbeta_id) content += `- 藏经经号: ${b.cbeta_id} (${b.canon_source || 'CBETA / 大正藏'})\n`;
      content += `- 分类: ${b.category} | 字数: ${wordStr}\n`;
      content += `- 核心提要: ${b.summary}\n\n`;
    });
  } else if (slug === 'collections.txt') {
    content += `# 禅宗十一大经藏部类与十四大专题合集 - ChanZong.space\n`;
    content += `> 更新日期: ${now}\n`;
    content += `> 部类导航: https://chanzong.space/categories\n`;
    content += `> 专题合集: https://chanzong.space/collections\n\n`;
    content += `## 一、十一大经藏部类 (${ZEN_CATEGORIES.length}大部类)\n\n`;
    ZEN_CATEGORIES.forEach((cat) => {
      content += `### ${cat.name} (${cat.subtitle})\n`;
      content += `- 链接: https://chanzong.space/categories/${cat.id}\n`;
      content += `- 核心定位: ${cat.significance}\n`;
      content += `- 深度导读: ${cat.description}\n`;
      content += `- 包含经典 (${cat.classicIds.length}部): ${cat.classicIds.join(', ')}\n\n`;
    });
    content += `## 二、十四大宗师与根本经典合集 (${ZEN_COLLECTIONS.length}部合集)\n\n`;
    ZEN_COLLECTIONS.forEach((col) => {
      content += `### 《${col.title}》 (${col.subtitle})\n`;
      content += `- 链接: https://chanzong.space/collections/${col.id}\n`;
      content += `- 著者与时代: ${col.author} (${col.period})\n`;
      if (col.cbetaRef) content += `- 藏经文献: ${col.cbetaRef}\n`;
      content += `- 导读提要: ${col.summary}\n`;
      if (col.historicalNotes && col.historicalNotes.length > 0) {
        content += `- 文献考据: ${col.historicalNotes.join('；')}\n`;
      }
      content += `- 子卷列表:\n`;
      col.books.forEach((bk) => {
        content += `  - ${bk.gateName}《${bk.title}》 (https://chanzong.space/classics/${bk.classicId}): ${bk.summary}\n`;
      });
      content += `\n`;
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
  } else if (slug === 'lineage.txt') {
    content += `# 禅宗祖师法脉传承谱系树 (西天二十八祖 · 东土六祖 · 五家七宗) - ChanZong.space\n`;
    content += `> 更新日期: ${now}\n`;
    content += `> 官方站点: https://chanzong.space/lineage\n\n`;
    content += renderLineageTree(ZEN_LINEAGE_TREE);
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
