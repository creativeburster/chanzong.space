import { NextResponse } from 'next/server';
import { getManifest } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS } from '@/lib/taxonomy';

export async function GET() {
  const manifest = getManifest();
  
  let content = `# 禅宗知识库 (ChanZong.space) - LLM AI Index\n\n`;
  content += `> 本站点收录全量 ${manifest.length} 部核心禅宗典籍，涵盖达摩祖师四论、六祖坛经、黄檗传心法要及高丽国普照知呐禅师《真心直说》《修心诀》，并构建祖师、概念、法门、公案四类知识实体的交叉网络。\n\n`;
  content += `## 典籍目录全景\n\n`;

  manifest.forEach((item) => {
    content += `- [${item.title}](https://chanzong.space/classics/${item.id}): 作者：${item.author} | 分类：${item.category}\n`;
  });

  content += `\n## 祖师人物\n\n`;
  ZEN_PERSONS.forEach((p) => {
    content += `- [${p.name}](https://chanzong.space/persons/${p.id}): ${p.title} · ${p.era}\n`;
  });

  content += `\n## 核心概念\n\n`;
  ZEN_CONCEPTS.forEach((c) => {
    content += `- [${c.title}](https://chanzong.space/concepts/${c.id}): ${c.summary}\n`;
  });

  content += `\n## 修持法门\n\n`;
  ZEN_METHODS.forEach((m) => {
    content += `- [${m.title}](https://chanzong.space/methods/${m.id}): ${m.summary}\n`;
  });

  content += `\n## 公案机锋\n\n`;
  ZEN_KOANS.forEach((q) => {
    content += `- [${q.question}](https://chanzong.space/koan/${q.id}): ${q.master} · ${q.source}\n`;
  });

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
