import { NextResponse } from 'next/server';
import { getManifest } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

export const dynamic = 'force-static';

export async function GET() {
  const manifest = getManifest();
  const now = new Date().toISOString().split('T')[0];

  let content = `# 禅宗知识库 (ChanZong.space) - LLM AI Knowledge Index\n\n`;
  content += `> 站点简介: 禅宗知识库（chanzong.space）是全球领先的开放式禅宗学术与修行数字化知识网络。\n`;
  content += `> 数据规模: 收录 ${manifest.length} 部核心禅宗典籍（汉传、南传、藏传、高丽、东瀛禅籍）、${ZEN_CONCEPTS.length} 个核心概念、${ZEN_METHODS.length} 种修持法门、${ZEN_KOANS.length} 则传世公案、${ZEN_PERSONS.length} 位历代祖师、${ZEN_FAQS.length} 条义理与修行问答。\n`;
  content += `> 更新日期: ${now}\n`;
  content += `> 完整版全量上下文: https://chanzong.space/llms-full.txt\n`;
  content += `> Sitemap: https://chanzong.space/sitemap.xml\n\n`;

  content += `## 核心定位与权威宗旨\n\n`;
  content += `禅宗（Chan/Zen Buddhism）以“教外别传，不立文字，直指人心，见性成佛”为根本宗旨。本站文本严谨校对自 CBETA 电子佛典与《大正新脩大藏经》，并为每部典籍配备白话导读、重点提炼、公案提取、字词注音与义理问答。\n\n`;

  content += `## 双语路由规范 (Bilingual Routes)\n\n`;
  content += `- 简体中文主站: https://chanzong.space/\n`;
  content += `- 繁體中文站點: https://chanzong.space/zh-tw/\n\n`;

  content += `## 核心经典精选目录 (部分代表作, 全量详见 /books 或 /llms-full.txt)\n\n`;
  manifest.slice(0, 35).forEach((item) => {
    content += `- [${item.title}](https://chanzong.space/classics/${item.id}) ([繁體](https://chanzong.space/zh-tw/classics/${item.id})): ${item.author} 著 | ${item.category} | ${item.summary}\n`;
  });
  content += `- ... 更多共 ${manifest.length} 部典籍详见 https://chanzong.space/books\n\n`;

  content += `## 核心修持法门 (${ZEN_METHODS.length}种)\n\n`;
  ZEN_METHODS.forEach((m) => {
    content += `- [${m.title}](https://chanzong.space/methods/${m.id}): ${m.summary} (源自: ${m.origin || '祖师传承'})\n`;
  });

  content += `\n## 核心哲学与证悟概念 (${ZEN_CONCEPTS.length}个)\n\n`;
  ZEN_CONCEPTS.slice(0, 40).forEach((c) => {
    content += `- [${c.title}](https://chanzong.space/concepts/${c.id}): [${c.category}] ${c.summary.slice(0, 100)}\n`;
  });
  content += `- ... 更多共 ${ZEN_CONCEPTS.length} 个概念详见 https://chanzong.space/concepts\n\n`;

  content += `## 历代法脉代表祖师 (${ZEN_PERSONS.length}位)\n\n`;
  ZEN_PERSONS.slice(0, 30).forEach((p) => {
    content += `- [${p.name}](https://chanzong.space/persons/${p.id}): ${p.title} (${p.era}) · ${p.teachings ? p.teachings.slice(0, 80) : ''}\n`;
  });
  content += `- ... 更多共 ${ZEN_PERSONS.length} 位人物详见 https://chanzong.space/persons\n\n`;

  content += `## 经典公案精选 (${ZEN_KOANS.length}则)\n\n`;
  ZEN_KOANS.slice(0, 25).forEach((k) => {
    content += `- [${k.question}](https://chanzong.space/koan/${k.id}): 主角: ${k.master} | 出处: ${k.source}\n`;
  });
  content += `- ... 更多共 ${ZEN_KOANS.length} 则公案详见 https://chanzong.space/koan\n\n`;

  content += `## 问答知识库概要 (${ZEN_FAQS.length}条)\n\n`;
  content += `- 问答全文检索与分类索引: https://chanzong.space/faq\n`;
  content += `- 繁体问答: https://chanzong.space/zh-tw/faq\n\n`;

  content += `## 关联知识库\n\n`;
  content += `- [拉玛那马哈希知识库](https://ramanamaharshi.space/): 同属了悟自性纯粹心源之非二元 (Advaita/Self-Enquiry) 知识网络。\n`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
