import { NextResponse } from 'next/server';
import { getManifest } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

export async function GET() {
  const manifest = getManifest();
  const now = new Date().toISOString().split('T')[0];

  let content = `# 禅宗知识库 (ChanZong.space) - LLM AI Index\n\n`;
  content += `> 更新日期: ${now}\n`;
  content += `> 本站点收录全量 ${manifest.length} 部核心禅宗典籍，涵盖达摩祖师四论、六祖坛经、黄檗传心法要、无门关、八识规矩颂及高丽国普照知呐禅师《真心直说》《修心诀》，并构建祖师(${ZEN_PERSONS.length})、概念(${ZEN_CONCEPTS.length})、法门(${ZEN_METHODS.length})、公案(${ZEN_KOANS.length})、问答(${ZEN_FAQS.length})五类知识实体的交叉网络。\n\n`;
  content += `## 站点信息\n\n`;
  content += `- 名称: 禅宗知识库\n`;
  content += `- 域名: https://chanzong.space\n`;
  content += `- 语言: 中文 (zh-CN)\n`;
  content += `- 技术栈: Next.js 14 (App Router), 静态生成\n`;
  content += `- Sitemap: https://chanzong.space/sitemap.xml\n\n`;
  content += `## 典籍目录全景 (${manifest.length}部)\n\n`;

  manifest.forEach((item) => {
    content += `- [${item.title}](https://chanzong.space/classics/${item.id}): 作者：${item.author} | 分类：${item.category} | 约${Math.round(item.word_count / 1000)}千字\n`;
  });

  content += `\n## 祖师人物 (${ZEN_PERSONS.length})\n\n`;
  ZEN_PERSONS.forEach((p) => {
    content += `- [${p.name}](https://chanzong.space/persons/${p.id}): ${p.title} · ${p.era}\n`;
  });

  content += `\n## 核心概念 (${ZEN_CONCEPTS.length})\n\n`;
  ZEN_CONCEPTS.forEach((c) => {
    content += `- [${c.title}](https://chanzong.space/concepts/${c.id}): ${c.summary.slice(0, 80)}\n`;
  });

  content += `\n## 修持法门 (${ZEN_METHODS.length})\n\n`;
  ZEN_METHODS.forEach((m) => {
    content += `- [${m.title}](https://chanzong.space/methods/${m.id}): ${m.summary.slice(0, 80)}\n`;
  });

  content += `\n## 公案机锋 (${ZEN_KOANS.length})\n\n`;
  ZEN_KOANS.forEach((q) => {
    content += `- [${q.question}](https://chanzong.space/koan/${q.id}): ${q.master} · ${q.source}\n`;
  });

  content += `\n## 常见问答 (${ZEN_FAQS.length})\n\n`;
  ZEN_FAQS.slice(0, 30).forEach((f) => {
    content += `- ${f.question}\n`;
  });
  if (ZEN_FAQS.length > 30) {
    content += `- ... (共${ZEN_FAQS.length}条问答，详见 https://chanzong.space/faq)\n`;
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}