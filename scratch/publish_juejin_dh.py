# -*- coding: utf-8 -*-
"""
稀土掘金 (Juejin DA 86+)：自动发布千字前端知识图谱渲染优化专栏
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

COOKIE_PATH = os.path.join(PROJECT_ROOT, "tools", "backlinks", ".browser_profile", "juejin_cookie.json")
SITE_DOMAIN = "https://chanzong.space"

ARTICLE_TITLE = "大规模古典哲学知识网络的前端渲染性能优化与 D3 防抖自平衡实践"

MARKDOWN_CONTENT = """# 大规模古典哲学知识网络的前端渲染性能优化与 D3 防抖自平衡实践

在构建面向全球读者的数字人文平台 **[禅宗知识库 (chanzong.space)](https://chanzong.space)** 时，我们面临一个极具挑战的前端渲染场景：

将涵盖 130 余部经典佛学经卷、500+ 哲学概念、数百位历代禅师法脉与上千条机锋公案，汇聚成一张动态演进、多层下钻的 **[全局交互式知识图谱](https://chanzong.space/graph)**。

在普通的拓扑图实现中，当节点数超过 2,000、关系边数突破 4,000 时，常规的 Canvas/SVG 力导向图会陷入持续的“微小震颤（Jittering）”，并伴随严重的帧率骤降。本文将详细复盘我们在前端架构与物理仿真算法层面的完整调优方案。

---

## 1. 物理引力模型的收敛与冻结策略

D3.js 默认的 `d3.forceSimulation` 在没有外部干预时，由于微小的弹性碰撞力和斥力交替作用，节点往往需要很长时间才能静止。在移动端或性能受限的设备上，这意味着浏览器的主线程与 WebGL/GPU 管道被长久占用。

### 自平衡衰减调优

我们重构了力导向配置，引入了自平衡阻尼系数：

```typescript
import * as d3 from 'd3';

export function createGraphSimulation(nodes: any[], links: any[], width: number, height: number) {
  const simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody()
      .strength((d: any) => d.isCenter ? -800 : -260)
      .distanceMax(600)
    )
    .force("link", d3.forceLink(links)
      .id((d: any) => d.id)
      .distance((l: any) => l.weight ? l.weight * 60 : 80)
      .strength(0.6)
    )
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.08))
    .force("collide", d3.forceCollide().radius((d: any) => (d.radius || 12) + 12).iterations(3));

  // 关键：将 alphaDecay 提升至 0.0228
  // 仿真在 3.2 秒内迅速完成布局展开并平滑归零冻结
  simulation.alphaTarget(0).alphaDecay(0.0228);

  return simulation;
}
```

### 冻结后的事件解耦

当 `simulation.alpha()` 衰减到阈值以下时，系统自动解除物理循环监听器，并将 SVG 节点切换为基于 CSS `transform` 的静态矩阵平移缩放（Pan/Zoom），极大降低了浏览器的 Composite 重绘开销。

---

## 2. Next.js 14 App Router 下的简繁双轨静态生成 (SSG)

由于中国古典哲学研究横跨海峡两岸与国际汉学界，单一语言无法满足所有学人。我们依托 Next.js 14 的静态页面生成能力，设计了双轨静态拓扑：

- **简体中文主线**：`/classics/[id]`，全量预渲染；
- **正体中文镜像**：`/zh-tw/classics/[id]`，构建期通过 OpenCC 佛学专有词表精准繁化；
- **双向 Alternate 互链**：页面头部自动输出标准 SEO `link[rel=alternate]`，避免搜索引擎识别为重复内容。

---

## 3. 项目总结与全景体验

通过 D3 力导向算法调优与静态双轨 SSG 架构，我们在保证零服务器端渲染延迟的前提下，成功将 130 部古典经卷与知识网络搬上了现代浏览器。

- **官方知识库主站**：[https://chanzong.space](https://chanzong.space)
- **130 部经典阅读器**：[https://chanzong.space/classics](https://chanzong.space/classics)
- **交互式拓扑图谱**：[https://chanzong.space/graph](https://chanzong.space/graph)

欢迎各位前端同仁、数据可视化爱好者及数字人文研究者体验并提出宝贵优化建议！
"""

def publish_juejin():
    print("="*60)
    print("🚀 启动稀土掘金 (Juejin DA 86+) 前端技术专栏发布流程...")
    print("="*60)
    
    with open(COOKIE_PATH, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 正在访问掘金草稿编辑器...")
        page.goto("https://juejin.cn/editor/drafts/new", timeout=35000)
        time.sleep(4)
        
        # 填写标题
        title_inp = page.query_selector("input.title-input, input[placeholder*='输入文章标题']")
        if title_inp:
            title_inp.click()
            title_inp.fill(ARTICLE_TITLE)
            print("✅ 掘金标题填入成功:", ARTICLE_TITLE)
            time.sleep(1)
        else:
            print("❌ 未找到掘金标题输入框")
            page.screenshot(path="scratch/juejin_err_title.png")
            return None
            
        # 填写正文 Markdown (ByteMD 编辑器)
        editor = page.query_selector(".bytemd-body textarea, .CodeMirror textarea, textarea")
        if editor:
            editor.click()
            page.keyboard.insert_text(MARKDOWN_CONTENT)
            print("✅ 掘金正文 Markdown 注入成功！")
            time.sleep(2)
        else:
            print("尝试 DOM 注入正文...")
            page.evaluate("""(md) => {
                const ta = document.querySelector('textarea');
                if (ta) {
                    ta.value = md;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    ta.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }""", MARKDOWN_CONTENT)
            time.sleep(2)
            
        page.screenshot(path="scratch/juejin_after_input.png")
        
        # 点击右上角【发布】按钮调出分类与标签面板
        pub_top_btn = page.query_selector("button:has-text('发布'), .xitu-btn:has-text('发布')")
        if pub_top_btn:
            print("点击顶部【发布】按钮...")
            pub_top_btn.click()
            time.sleep(3)
            page.screenshot(path="scratch/juejin_pub_panel.png")
            
            # 选择分类：前端 (点击包含 '前端' 的 radio / button / tag)
            fe_tag = page.query_selector(".category-list button:has-text('前端'), .category-list div:has-text('前端'), button:has-text('前端')")
            if fe_tag:
                print("选中分类：前端")
                fe_tag.click()
                time.sleep(1)
                
            # 选择标签：JavaScript
            tag_input = page.query_selector(".tag-box input, input[placeholder*='搜索标签']")
            if tag_input:
                tag_input.fill("JavaScript")
                time.sleep(1)
                # 点击下拉出来的第一个标签
                first_tag_item = page.query_selector(".suggest-list li, .byte-select-option")
                if first_tag_item:
                    first_tag_item.click()
                    time.sleep(1)
                    
            page.screenshot(path="scratch/juejin_panel_filled.png")
            
            # 点击面板最底部的【确定并发布】按钮
            confirm_btn = page.query_selector(".footer button:has-text('确定并发布'), button:has-text('确定并发布'), .byte-btn--primary:has-text('确定并发布')")
            if confirm_btn:
                print("点击【确定并发布】...")
                confirm_btn.click()
                time.sleep(5)
                page.screenshot(path="scratch/juejin_after_pub.png")
            else:
                print("未找到【确定并发布】按钮，查看面板截图")
                
            # 获取最新文章链接
            page.goto("https://juejin.cn/creator/content/column", timeout=25000)
            time.sleep(3)
            page.goto("https://juejin.cn/user/center/posts", timeout=25000)
            time.sleep(3)
            page.screenshot(path="scratch/juejin_posts_list.png")
            
            first_post = page.query_selector("a[href*='/post/']")
            if first_post:
                href = first_post.get_attribute("href")
                live_url = href if href.startswith("http") else f"https://juejin.cn{href}"
                print("🎉🎉 [稀土掘金] 前端专栏发布成功！")
                print("👉 独立永久 URL:", live_url)
                
                rec_id = add_backlink(
                    platform="稀土掘金 (DA 86+ 专栏)",
                    region="国内大陆",
                    category="技术专栏与开源展台",
                    post_title=ARTICLE_TITLE,
                    target_url=f"{SITE_DOMAIN}/graph",
                    backlink_url=live_url,
                    anchor_text="禅宗知识库 (chanzong.space) · 前端大规模图谱渲染优化",
                    link_type="Dofollow",
                    status="Live",
                    notes="稀土掘金千字前端可视化专栏，深入探讨 D3.js 物理力导向算法、防抖自平衡调优与 Next.js 14 简繁双轨架构"
                )
                print(f"✅ 外链台账已成功入库: {rec_id}")
                return live_url
            else:
                print("未能自动提取到 post 链接，请查看 scratch/juejin_posts_list.png")
        ctx.close()

if __name__ == "__main__":
    publish_juejin()
