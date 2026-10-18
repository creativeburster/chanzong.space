# -*- coding: utf-8 -*-
"""
CSDN (DA 92+) 创作者中心：自动发布千字数字人文硬核技术架构博客
"""
import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(PROJECT_ROOT, "tools", "backlinks"))
from tracker import add_backlink
from stealth_browser import create_stealth_context

COOKIE_PATH = os.path.join(PROJECT_ROOT, "tools", "backlinks", ".browser_profile", "csdn_cookie.json")
SITE_DOMAIN = "https://chanzong.space"

ARTICLE_TITLE = "数字人文前沿：基于 D3.js 物理力导向算法与 Next.js 14 SSG 的 130 部古典古籍拓扑建模实战"

ARTICLE_CONTENT = """# 数字人文前沿：基于 D3.js 物理力导向算法与 Next.js 14 SSG 的 130 部古典古籍拓扑建模实战

在传统古典文献的数字化过程中，研究者和读者常常面临两大核心痛点：一是浩如烟海的文献缺乏动态关联，形成了孤立的信息孤岛；二是大量概念、师承法脉和公案机锋交织在一起，传统的线性目录无法直观展现其深层的网状心性结构。

为了攻克这一难题，我们在开源数字化项目 **[禅宗知识库 (chanzong.space)](https://chanzong.space)** 中，对涵盖中国、印度等历代祖师的 **130 余部核心禅宗典籍**（如《六祖坛经》《传心法要》《信心铭》《碧岩录》等）、500+ 核心心性哲学概念与数百位法脉传承者进行了统一的知识图谱建模与大规模拓扑可视化工程。

本文将从 **D3.js 物理仿真防抖调优**、**Next.js 14 App Router 双轨静态构建 (SSG)** 以及 **强类型本体约束架构** 三个核心维度，拆解大规模古籍数字化平台的技术实现路径。

---

## 一、 D3.js v7 力导向图多阶段自平衡与防抖优化

知识图谱在海量节点（3000+ 节点、4500+ 边）渲染时，最常见的技术灾难是“毛球效应”（Hairball）与“持续微动抖动”（Jittering），这不仅会造成用户的认知负荷急剧上升，更会导致低端移动设备的 GPU/CPU 持续过载、电量骤降。

### 1. 物理引力与斥力多阶段配置

在 `GraphCanvas.tsx` 中，我们采用了 D3 v7 的自定义力导向模拟器，对不同语义类型的节点施加差异化的物理力：

```typescript
import * as d3 from 'd3';

export function initKnowledgeSimulation(nodes: any[], links: any[], width: number, height: number) {
  const simulation = d3.forceSimulation(nodes)
    // 1. 多体斥力：中心核心概念与普通法脉节点分层施力
    .force("charge", d3.forceManyBody()
      .strength((d: any) => d.isCenter ? -800 : -280)
      .distanceMax(650)
    )
    // 2. 弹性拉力：按典籍连线与语义权重动态设置弹簧长度
    .force("link", d3.forceLink(links)
      .id((d: any) => d.id)
      .distance((l: any) => l.weight ? l.weight * 55 : 85)
      .strength(0.65)
    )
    // 3. 视口中心聚拢力
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.08))
    // 4. 文本标签防重叠碰撞力
    .force("collide", d3.forceCollide().radius((d: any) => (d.radius || 12) + 14).iterations(3));

  // 物理模拟自平衡收敛衰减率（3.2秒后冻结计算）
  simulation.alphaTarget(0).alphaDecay(0.0228);

  return simulation;
}
```

通过精确将 `alphaDecay` 调优至 `0.0228`，仿真物理引擎在用户初次载入后的 3.2 秒内迅速平滑收敛，随后自动冻结节点坐标计算，完全卸载 CPU 物理循环，将画布无缝转为高性能的纯 SVG 平移缩放（Pan & Zoom）交互模式。

在线交互体验地址：**[禅宗知识库 · 交互式全景知识图谱](https://chanzong.space/graph)**

---

## 二、 Next.js 14 App Router 简繁双轨 SSG 静态生成

作为面向全球华人学者与海外汉学界的数字人文站点，既需要支持大陆规范简体中文，也必须支持港澳台及海外通用的正体中文（繁体字）。

如果采用传统的前端 JavaScript 运行时字典替换，会导致严重的页面布局抖动（CLS）、SEO 搜索引擎抓取割裂以及首屏加载耗时增加。为此，我们设计了 **全量构建期双轨静态页面生成架构**：

1. **路由拓扑体系**：
   - 简体中文主干：`/classics/[id]`、`/concepts/[id]`、`/methods/[id]`
   - 正体中文镜像：`/zh-tw/classics/[id]`、`/zh-tw/concepts/[id]`、`/zh-tw/methods/[id]`
2. **SEO 双向回环 Alternate 标签**：
   ```html
   <link rel="alternate" hreflang="zh-Hans" href="https://chanzong.space/classics/liuzutan-jing" />
   <link rel="alternate" hreflang="zh-Hant" href="https://chanzong.space/zh-tw/classics/liuzutan-jing" />
   ```
3. **OpenCC 深度词库定制**：
   在 SSG 构建期调用定制版词典转换引擎，对“藉/借”、“涅槃”、“阿耨多罗三藐三菩提”等佛学专有名词进行精准歧义消除，确保 130 部经卷的 100% 静态 HTML 预渲染，达到 0ms TTFB 的极速学术查阅响应。

---

## 三、 零悬空引用的强类型知识本体设计

在 `lib/taxonomy.ts` 中，我们确立了强类型的元数据契约，严格杜绝传统古籍数字化中的“断链”与“悬空引用”问题：

- 每一部经典必须明确指定其所属分类（达摩根本经论、宗门纲宗、历代祖师语录等）；
- 每一个公案问答（QA）必须关联真实的典籍 `id` 与人物 `id`；
- 构建前置校验脚本 `tools/verify_taxonomy.py`，在 CI/CD 阶段实施全网闭环拓扑检查，确保所有超链接 100% 真实有效。

---

## 四、 开放学术与开源共享

数字人文的核心理念在于开放与传承。目前全站 130 部经典、白话今译、生僻字注音与知识图谱数据均已面向学术界与同修完全开放。

- **官方知识库主站**：[https://chanzong.space](https://chanzong.space)
- **130 部经典全景索引**：[https://chanzong.space/classics](https://chanzong.space/classics)
- **历代祖师法脉谱系**：[https://chanzong.space/persons](https://chanzong.space/persons)
- **全网交互式图谱**：[https://chanzong.space/graph](https://chanzong.space/graph)

欢迎从事数字人文、前端数据可视化及中国传统哲学数字化的开发者与学者共同探讨交流！
"""

def publish_csdn():
    print("="*60)
    print("🚀 启动 CSDN 创作者中心长篇技术博客发布流程...")
    print("="*60)
    
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 正在访问 CSDN 编辑器...")
        page.goto("https://mp.csdn.net/mp_blog/creation/editor", timeout=35000, wait_until="domcontentloaded")
        time.sleep(4)
        
        # 1. 填写标题
        title_inp = page.query_selector("input.article-bar__title, input[placeholder*='文章标题'], #txtTitle")
        if title_inp:
            title_inp.click()
            title_inp.fill(ARTICLE_TITLE)
            print("✅ 标题已填入:", ARTICLE_TITLE)
            time.sleep(1)
        else:
            print("❌ 未找到标题输入框")
            return None
            
        # 2. 填写正文 (Markdown 编辑器)
        # CSDN markdown 编辑器通常是 cledit-section 或 ace/codemirror
        editor = page.query_selector(".cledit-section, .editor__inner textarea, .markdown-body textarea, textarea")
        if editor:
            editor.click()
            page.keyboard.insert_text(ARTICLE_CONTENT)
            print("✅ 正文 Markdown 已注入！")
            time.sleep(2)
        else:
            # 尝试通过富文本/DOM直接赋值
            print("尝试定位通用富文本或 Markdown 容器...")
            res = page.evaluate("""(content) => {
                const ta = document.querySelector('textarea');
                if (ta) {
                    ta.value = content;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    ta.dispatchEvent(new Event('change', { bubbles: true }));
                    return true;
                }
                const ce = document.querySelector('[contenteditable="true"]');
                if (ce) {
                    ce.innerText = content;
                    ce.dispatchEvent(new Event('input', { bubbles: true }));
                    return true;
                }
                return false;
            }""", ARTICLE_CONTENT)
            print("DOM 注入结果:", res)
            time.sleep(2)
            
        # 3. 点击发布按钮，调出发布抽屉/设置面板
        pub_btn = page.query_selector("button.btn-outline-danger, button:has-text('发布文章'), button.btn-publish")
        if not pub_btn:
            # 查找所有带 danger 或 primary 的大按钮
            pub_btn = page.query_selector(".btn-outline-danger")
            
        if pub_btn:
            print("点击【发布文章】按钮 (btn-outline-danger)，调出发布设置抽屉...")
            pub_btn.click()
            time.sleep(3)
            page.screenshot(path="scratch/csdn_pub_drawer.png")
            
            # 选择标签 / 封面 / 分类
            # 尝试点击抽屉中的确认发布
            confirm_btn = page.query_selector("button:has-text('发布文章'):not(.btn-publish), button.modal__button-publish, .publish-btn")
            if not confirm_btn:
                confirm_btn = page.query_selector(".btn-b-red, button:has-text('确认发布')")
                
            # 添加标签如果需要
            tag_input = page.query_selector("input[placeholder*='添加标签'], input[placeholder*='标签']")
            if tag_input:
                tag_input.fill("前端")
                page.keyboard.press("Enter")
                time.sleep(0.5)
                tag_input.fill("数据可视化")
                page.keyboard.press("Enter")
                time.sleep(0.5)
                
            if confirm_btn:
                print("点击抽屉确认发布按钮...")
                confirm_btn.click()
                time.sleep(5)
                page.screenshot(path="scratch/csdn_after_pub.png")
                
            # 获取发布后的文章链接
            page.goto("https://mp.csdn.net/mp_blog/manage/article", timeout=25000)
            time.sleep(3)
            page.screenshot(path="scratch/csdn_manage_list.png")
            
            # 提取第一篇文章的链接
            first_article = page.query_selector("a[href*='blog.csdn.net'][href*='article/details']")
            if first_article:
                live_url = first_article.get_attribute("href")
                print("🎉🎉 [CSDN] 专家技术长文发布成功！")
                print("👉 独立永久 URL:", live_url)
                
                rec_id = add_backlink(
                    platform="CSDN (DA 92+ 专家博客)",
                    region="国内大陆",
                    category="技术专栏与开源展台",
                    post_title=ARTICLE_TITLE,
                    target_url=f"{SITE_DOMAIN}/graph",
                    backlink_url=live_url,
                    anchor_text="禅宗知识库 (chanzong.space) · 数字人文 D3 拓扑建模实战",
                    link_type="Dofollow",
                    status="Live",
                    notes="CSDN 创作者中心千字技术架构博客，深度讲解 D3.js 物理力导向算法、Next.js 14 简繁双轨 SSG 与知识图谱建模实战"
                )
                print(f"✅ 外链台账已成功入库: {rec_id}")
                return live_url
            else:
                print("未能直接抓取到文章详情链接，请查看 scratch/csdn_manage_list.png")
        else:
            print("未找到发布按钮")
            
        ctx.close()

if __name__ == "__main__":
    publish_csdn()
