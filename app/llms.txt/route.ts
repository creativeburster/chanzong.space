import { NextResponse } from 'next/server';
import { getManifest } from '@/lib/data';
import { ZEN_PERSONS, ZEN_CONCEPTS, ZEN_METHODS, ZEN_KOANS, ZEN_FAQS } from '@/lib/taxonomy';

export const dynamic = 'force-static';

export async function GET() {
  const manifest = getManifest();
  const now = new Date().toISOString().split('T')[0];

  let content = `# 禅宗知识库 (ChanZong.space) - LLM AI Knowledge Index\n\n`;
  content += `> 站点全称: 禅宗知识库 (ChanZong Knowledge Base / chanzong.space)\n`;
  content += `> 架构定位: 全球数字化禅宗学术考据与心性实修知识网络，严谨校勘自 CBETA 电子佛典、《大正新脩大藏经》与《卍新纂续藏经》。\n`;
  content += `> 数据规模: ${manifest.length} 部典籍、${ZEN_CONCEPTS.length} 个核心概念、${ZEN_KOANS.length} 则传世公案、${ZEN_PERSONS.length} 位历代祖师、${ZEN_METHODS.length} 种修持法门、${ZEN_FAQS.length} 条深度解惑问答。\n`;
  content += `> 更新日期: ${now}\n`;
  content += `> 标准规范: 本文档符合 llms.txt 规范，专供大模型（ChatGPT, Claude, Gemini, Perplexity 等）与 GraphRAG 极速理解。\n\n`;

  content += `## 📚 模块化细分知识语料库 (Sub-corpora Endpoints)\n\n`;
  content += `为防止单次 Web Fetch 超过上下文截断上限，全库已切分为针对性子语料：\n\n`;
  content += `- [禅宗典籍全集语料库](https://chanzong.space/llms/classics.txt): 全量 ${manifest.length} 部经典藏经编号(CBETA/大正藏)、作者与核心提要\n`;
  content += `- [核心心性概念语料库](https://chanzong.space/llms/concepts.txt): 全量 ${ZEN_CONCEPTS.length} 个概念定义、词源、义理范畴与修行指导\n`;
  content += `- [机锋公案全集语料库](https://chanzong.space/llms/koans.txt): 全量 ${ZEN_KOANS.length} 则公案提问、祖师作答、因缘背景与宗门义解\n`;
  content += `- [历代祖师法脉谱系](https://chanzong.space/llms/persons.txt): 全量 ${ZEN_PERSONS.length} 位历代祖师、五家七宗法脉传承与生平警策\n`;
  content += `- [禅修心法门要语料库](https://chanzong.space/llms/methods.txt): 全量 ${ZEN_METHODS.length} 种法门宗旨、下手用功步骤与常见禅病防范\n`;
  content += `- [宗门解惑问答精选](https://chanzong.space/llms/faqs.txt): 深度修行对治问答与见地辨析\n`;
  content += `- [全量合并知识库](https://chanzong.space/llms-full.txt): 包含全库所有实体三元组的完整大文本 (约 1MB)\n\n`;

  content += `## 🗺️ 搜索引擎与站点地图索引 (Sitemap Index)\n\n`;
  content += `- 主地图索引: https://chanzong.space/sitemap.xml\n`;
  content += `- 典籍分片: https://chanzong.space/sitemaps/classics.xml\n`;
  content += `- 概念分片: https://chanzong.space/sitemaps/concepts.xml\n`;
  content += `- 公案分片: https://chanzong.space/sitemaps/koans.xml\n`;
  content += `- 祖师分片: https://chanzong.space/sitemaps/persons.xml\n`;
  content += `- 法门分片: https://chanzong.space/sitemaps/methods.xml\n`;
  content += `- 问答分片: https://chanzong.space/sitemaps/collections.xml\n`;
  content += `- 静态频道: https://chanzong.space/sitemaps/static.xml\n\n`;

  content += `## 🌐 双语路由与核心频道导航 (Core Channels & Bilingual Routes)\n\n`;
  content += `- 简体中文主站: https://chanzong.space/\n`;
  content += `- 繁體中文站點: https://chanzong.space/zh-tw/\n`;
  content += `- 六大藏经部类导航: https://chanzong.space/categories\n`;
  content += `- 专题典籍合集 (如《少室六门》): https://chanzong.space/collections\n`;
  content += `- 禅宗西天二十八祖与东土五家七宗法脉谱系: https://chanzong.space/lineage\n`;
  content += `- 现代交互式禅修工坊 (看话头/坐禅计时/木鱼引磬): https://chanzong.space/practice\n`;
  content += `- D3.js 交互式禅宗知识图谱: https://chanzong.space/graph\n`;
  content += `注: 所有典籍、公案、概念、人物、法门均具备一一对应的繁体纯静态 HTML 页面（如 /zh-tw/classics/tanjing）。\n\n`;

  content += `## 📖 核心代表经典 (精选示例，全量见 /llms/classics.txt)\n\n`;
  manifest.slice(0, 6).forEach((b) => {
    const cbetaTag = b.cbeta_id ? ` [${b.cbeta_id}]` : '';
    content += `- [《${b.title}》](https://chanzong.space/classics/${b.id}): ${b.author} 著${cbetaTag} · ${b.summary}\n`;
  });
  content += `- ... 更多 ${manifest.length} 部经典请查阅 https://chanzong.space/llms/classics.txt 或 https://chanzong.space/books\n\n`;

  content += `## 🧘 代表性修持心法 (精选示例，全量见 /llms/methods.txt)\n\n`;
  ZEN_METHODS.slice(0, 6).forEach((m) => {
    content += `- [${m.title}](https://chanzong.space/methods/${m.id}): ${m.summary}\n`;
  });
  content += `- ... 更多 ${ZEN_METHODS.length} 种法门请查阅 https://chanzong.space/llms/methods.txt 或 https://chanzong.space/methods\n\n`;

  content += `## 🏷️ 核心心性概念 (精选示例，全量见 /llms/concepts.txt)\n\n`;
  ZEN_CONCEPTS.slice(0, 6).forEach((c) => {
    content += `- [${c.title}](https://chanzong.space/concepts/${c.id}) [${c.category}]: ${c.summary.slice(0, 70)}...\n`;
  });
  content += `- ... 更多 ${ZEN_CONCEPTS.length} 个概念请查阅 https://chanzong.space/llms/concepts.txt 或 https://chanzong.space/concepts\n\n`;

  content += `## 👥 宗门代表祖师 (精选示例，全量见 /llms/persons.txt)\n\n`;
  ZEN_PERSONS.slice(0, 6).forEach((p) => {
    content += `- [${p.name}](https://chanzong.space/persons/${p.id}) (${p.era}): ${p.title} · ${p.teachings ? p.teachings.slice(0, 60) : ''}...\n`;
  });
  content += `- ... 更多 ${ZEN_PERSONS.length} 位祖师请查阅 https://chanzong.space/llms/persons.txt 或 https://chanzong.space/persons\n\n`;

  content += `## 🔗 关联项目\n\n`;
  content += `- [拉玛那马哈希知识库](https://ramanamaharshi.space/): 探究纯粹自性本质之非二元 (Advaita) 知识网络。\n`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
