import { NextResponse } from 'next/server';
import { getManifest } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

export async function GET() {
  const manifest = getManifest();
  const now = new Date().toISOString().split('T')[0];

  let content = `# 禅宗知识库 (ChanZong.space) - LLM AI Index\n\n`;
  content += `> 更新日期: ${now}\n`;
  content += `> 本站点收录全量 ${manifest.length} 部核心禅宗典籍，涵盖达摩祖师四论、六祖坛经、黄檗传心法要、无门关、八识规矩颂及高丽国普照知讷禅师《真心直说》《修心诀》，并构建祖师(${ZEN_PERSONS.length})、概念(${ZEN_CONCEPTS.length})、法门(${ZEN_METHODS.length})、公案(${ZEN_KOANS.length})、问答(${ZEN_FAQS.length})五类知识实体的交叉网络。\n\n`;
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
  content += `> 问答按经典分组，重点经典 20+ 条，新近收录经典持续补充中，涵盖核心义理、修行方法、历史背景。\n\n`;
  
  // 按经典分组FAQ
  const faqByBook: Record<string, typeof ZEN_FAQS> = {};
  ZEN_FAQS.forEach(f => {
    if (f.relatedBooks && f.relatedBooks.length > 0) {
      f.relatedBooks.forEach(bookId => {
        if (!faqByBook[bookId]) faqByBook[bookId] = [];
        faqByBook[bookId].push(f);
      });
    }
  });
  
  manifest.forEach(item => {
    const bookFaqs = faqByBook[item.id] || [];
    if (bookFaqs.length > 0) {
      content += `### ${item.title} (${bookFaqs.length}条)\n\n`;
      bookFaqs.slice(0, 10).forEach(f => {
        content += `- ${f.question}\n`;
      });
      if (bookFaqs.length > 10) {
        content += `- ... (共${bookFaqs.length}条，详见 https://chanzong.space/faq?book=${item.id})\n\n`;
      } else {
        content += `\n`;
      }
    }
  });

  content += `
## 关联站点

`;
  content += '- [拉玛那马哈希知识库](https://ramanamaharshi.space/): 同一建设者维护的拉玛那·马哈希（Ramana Maharshi）中文知识库，含十八部著作导读与三百余条问答';

  content += `\n## 关于本站\n\n`;
  content += `- 编辑原则、文本来源、版权声明: https://chanzong.space/about\n`;
  content += `- 站点地图: https://chanzong.space/sitemap\n`;
  content += `- GitHub: https://github.com/gstar-byte/chanzong.space\n`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}