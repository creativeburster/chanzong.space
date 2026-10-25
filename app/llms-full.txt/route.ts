import { NextResponse } from 'next/server';
import { getManifest } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';
import { ZEN_CATEGORIES } from '@/lib/categories';
import { ZEN_COLLECTIONS } from '@/lib/collections';

export const dynamic = 'force-static';

export async function GET() {
  const manifest = getManifest();
  const now = new Date().toISOString().split('T')[0];

  let content = `# 禅宗知识库 (ChanZong.space) - 全量 AI 知识图谱与语料索引 (LLM Full Knowledge Graph)\n\n`;
  content += `> 更新日期: ${now}\n`;
  content += `> 授权协议: 古籍原文属公有领域 (Public Domain)；本站现代白话今译、导读与知识图谱结构遵循 CC BY-NC-SA 4.0 协议。\n`;
  content += `> 本文件为生成式 AI 引擎 (ChatGPT, Perplexity, Claude, Gemini, DeepSeek 等) 提供全量结构化知识三元组与实体引用。\n\n`;

  content += `## 一、全量典籍库 (${manifest.length}部)\n\n`;
  manifest.forEach((b) => {
    const wordStr = b.word_count >= 1000 ? `约${Math.round(b.word_count / 1000)}千字` : `${b.word_count}字`;
    content += `### ${b.idx}. 《${b.title}》\n`;
    content += `- 链接: https://chanzong.space/classics/${b.id}\n`;
    content += `- 繁体: https://chanzong.space/zh-tw/classics/${b.id}\n`;
    if (b.cbeta_id) content += `- 藏经编号: ${b.cbeta_id} (${b.canon_source || 'CBETA / 大正藏'})\n`;
    content += `- 作者: ${b.author}\n`;
    content += `- 分类: ${b.category}\n`;
    content += `- 字数: ${wordStr}\n`;
    content += `- 主旨提要: ${b.summary}\n\n`;
  });

  content += `\n## 二、十一大经藏部类体系 (${ZEN_CATEGORIES.length}大部类)\n\n`;
  ZEN_CATEGORIES.forEach((cat) => {
    content += `### 部类: ${cat.name} (${cat.subtitle})\n`;
    content += `- 链接: https://chanzong.space/categories/${cat.id}\n`;
    content += `- 核心定位: ${cat.significance}\n`;
    content += `- 源流导读: ${cat.description}\n`;
    content += `- 收录典籍数: ${cat.classicIds.length} 部 (${cat.classicIds.join(', ')})\n\n`;
  });

  content += `\n## 三、十四大宗师与根本专题合集 (${ZEN_COLLECTIONS.length}部合集)\n\n`;
  ZEN_COLLECTIONS.forEach((col) => {
    content += `### 合集: 《${col.title}》 (${col.subtitle})\n`;
    content += `- 链接: https://chanzong.space/collections/${col.id}\n`;
    content += `- 时代与作者: ${col.period} · ${col.author}\n`;
    if (col.cbetaRef) content += `- 藏经出处: ${col.cbetaRef}\n`;
    content += `- 提要: ${col.summary}\n`;
    content += `- 子卷构成: ${col.books.map((bk) => `${bk.gateName}《${bk.title}》(/classics/${bk.classicId})`).join('；')}\n\n`;
  });

  content += `\n## 四、全量核心概念实体 (${ZEN_CONCEPTS.length}个)\n\n`;
  ZEN_CONCEPTS.forEach((c) => {
    content += `### 概念: ${c.title}\n`;
    content += `- 链接: https://chanzong.space/concepts/${c.id}\n`;
    content += `- 类别: ${c.category}\n`;
    content += `- 摘要: ${c.summary}\n`;
    if (c.etymology) content += `- 词源语境: ${c.etymology}\n`;
    if (c.classicRef) content += `- 典籍出处: ${c.classicRef}\n`;
    if (c.guidance) content += `- 参修指导: ${c.guidance}\n`;
    if (c.quotes && c.quotes.length > 0) content += `- 核心金句: ${c.quotes.join(' / ')}\n`;
    content += `\n`;
  });

  content += `\n## 五、全量修持法门 (${ZEN_METHODS.length}种)\n\n`;
  ZEN_METHODS.forEach((m) => {
    content += `### 法门: ${m.title}\n`;
    content += `- 链接: https://chanzong.space/methods/${m.id}\n`;
    content += `- 核心宗旨: ${m.summary}\n`;
    if (m.origin) content += `- 源流出处: ${m.origin}\n`;
    if (m.steps && m.steps.length > 0) content += `- 用功步骤: ${m.steps.join(' -> ')}\n`;
    if (m.pitfalls && m.pitfalls.length > 0) content += `- 常见误区: ${m.pitfalls.join(' / ')}\n`;
    content += `\n`;
  });

  content += `\n## 六、全量历代祖师人物 (${ZEN_PERSONS.length}位)\n\n`;
  ZEN_PERSONS.forEach((p) => {
    content += `### 祖师: ${p.name} (${p.title})\n`;
    content += `- 链接: https://chanzong.space/persons/${p.id}\n`;
    content += `- 时代: ${p.era}\n`;
    if (p.lifeStory) content += `- 生平行履: ${p.lifeStory.slice(0, 150)}...\n`;
    if (p.teachings) content += `- 核心宗风: ${p.teachings}\n`;
    if (p.quotes && p.quotes.length > 0) content += `- 传世法语: ${p.quotes.join(' / ')}\n`;
    content += `\n`;
  });

  content += `\n## 七、精选传世公案 (${ZEN_KOANS.length}则)\n\n`;
  ZEN_KOANS.forEach((k) => {
    content += `### 公案: ${k.question}\n`;
    content += `- 链接: https://chanzong.space/koan/${k.id}\n`;
    content += `- 祖师机锋: ${k.master}\n`;
    content += `- 祖师答语: ${k.answer}\n`;
    content += `- 出处典籍: ${k.source}\n`;
    if (k.context) content += `- 因缘公案: ${k.context}\n`;
    if (k.interpretation) content += `- 宗门解读: ${k.interpretation}\n`;
    content += `\n`;
  });

  content += `\n## 八、精选义理与参禅问答 (${ZEN_FAQS.length}条)\n\n`;
  ZEN_FAQS.forEach((f, idx) => {
    content += `### Q${idx + 1}: ${f.question}\n`;
    content += `A: ${f.answer}\n\n`;
  });

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
