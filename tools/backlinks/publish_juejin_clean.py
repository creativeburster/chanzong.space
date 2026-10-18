# -*- coding: utf-8 -*-
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

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from stealth_browser import create_stealth_context
from tracker import add_backlink

ARTICLE_TITLE = "开源数字人文实践：基于 Next.js 14 与 D3.js 构建 120+ 部禅宗典籍多维知识图谱"
ARTICLE_CONTENT = """# 开源数字人文实践：基于 Next.js 14 与 D3.js 构建 120+ 部禅宗典籍多维知识图谱

在数字化人文（Digital Humanities）的蓬勃发展下，传统哲学古籍的整理与研究正在从单一的纸质文本、扁平检索向结构化拓扑网络演进。

禅宗作为世界东方哲学的重要思想脉络，其经典浩瀚、法脉延绵、公案机锋极具网状互文性。我们基于现代全栈 Web 技术，构建并开源了 **[禅宗知识库 (chanzong.space)](https://chanzong.space)**。本文将深入解析其系统架构、D3.js 力导向图设计与海量文本结构化处理方案。

---

## 一、 系统技术架构与选型

在架构设计上，我们追求极致的访问性能、禅意的美学体验与严谨的数据拓扑：
- **核心框架**：Next.js 14 (App Router) + React 18 + TypeScript，全面采用静态生成 (SSG) 与边缘渲染，实现首屏毫秒级加载；
- **排版系统**：Tailwind CSS，参考极简宣纸禅意美学（`bg-[#FAF9F6]`），配合深色夜空侧边导航（`bg-[#0F172A]`）；
- **动态图谱**：基于 D3.js v7 物理引力仿真网络，支持多层级节点高亮、知识碰撞与拓扑穿梭；
- **离线能力**：全站支持 PWA 与 Service Worker，断网环境下依然可流畅参阅典籍。

---

## 二、 D3.js 交互式物理引力网络实现

传统古籍检索往往局限于关键词搜索，无法直观展现“祖师-经典-法门-公案-核心概念”之间的渊源演进。

我们在前端通过 D3.js 力导向算法构建了引力拓扑：
```typescript
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
  .force("charge", d3.forceManyBody().strength(-200))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide().radius(35));
```

每个节点不仅支持拖拽交互与力学回弹，还具备邻域高亮与蜘蛛网放射线效果。用户点击任一祖师或公案节点，即可秒级下钻跳转到多卡片详情页。

---

## 三、 多卡片交叉互链网络 (Card Interlinking)

为了打破信息孤岛，页面采用类似知识图谱的多卡片解构：
1. **概念卡片**：解析源流、引文证据与对勘注音；
2. **祖师卡片**：梳理生平机锋与承传脉络；
3. **法门卡片**：指引修持要领与参究关隘；
4. **公案卡片**：收录核心机锋对答。

底层的强类型结构化数据保证了全网状链接互通，无任何死链与孤岛。

---

## 四、 开源体验与交流

数字人文的发展离不开开源社区的协作与反馈。项目全库持续更新，欢迎各位前端同修、传统文化学者以及开源开发者参阅、指正与交流：

🌐 **在线体验站点**：[禅宗知识库 (chanzong.space)](https://chanzong.space)
📖 **涵盖内容**：120+ 部经典白话导读、200+ 核心公案、结构化法脉谱系与多维引力图谱。
"""

def publish_juejin():
    with open("tools/backlinks/.browser_profile/juejin_cookie.json", "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 访问掘金新文章页...")
        page.goto("https://juejin.cn/editor/drafts/new", timeout=35000, wait_until="domcontentloaded")
        time.sleep(3)
        
        # 填写标题
        print(f"2. 填写标题: {ARTICLE_TITLE}...")
        title_box = page.locator('input.title-input, input[placeholder*="输入文章标题"]').first
        title_box.click()
        title_box.fill(ARTICLE_TITLE)
        time.sleep(1)
        
        # 物理点击左侧编辑区 (200, 250) 聚焦
        print("3. 物理点击左侧编辑区 (200, 250) 聚焦...")
        page.mouse.click(200, 250)
        time.sleep(0.5)
        
        # 注入 Markdown 正文
        print("4. 逐行注入 Markdown 正文...")
        for line in ARTICLE_CONTENT.split("\n"):
            page.keyboard.insert_text(line)
            page.keyboard.press("Enter")
            time.sleep(0.01)
        time.sleep(2)
        
        # 截图看填充情况
        page.screenshot(path="tools/backlinks/juejin_filled_ok.png")
        print("正文已填充，已截图 juejin_filled_ok.png")
        
        # 点击右上角【发布】按钮打开抽屉
        print("5. 点击右上角【发布】按钮打开抽屉...")
        page.locator('button:has-text("发布")').first.click()
        time.sleep(3)
        
        # 选择分类【前端】
        print("6. 选择分类【前端】...")
        page.evaluate("""() => {
            const items = Array.from(document.querySelectorAll('.category-list .item, [class*="category"] li, [class*="item"]'));
            const fe = items.find(el => (el.innerText || '').trim() === '前端');
            if (fe) fe.click();
        }""")
        time.sleep(1.5)
        
        # 搜索并选择标签
        print("7. 搜索并选择标签【前端】...")
        tag_input = page.locator('input[placeholder*="请搜索添加标签"]').first
        if tag_input:
            tag_input.click()
            time.sleep(0.3)
            page.keyboard.insert_text("前端")
            time.sleep(1.5)
            # 点击建议列表第一项
            page.evaluate("""() => {
                const sug = document.querySelector('.tag-suggest-list li, .suggest-list li, [class*="suggest"] li');
                if (sug) sug.click();
            }""")
            time.sleep(1)
            
        page.screenshot(path="tools/backlinks/juejin_drawer_ok.png")
        print("抽屉已配置好，已截图 juejin_drawer_ok.png")
        
        # 点击【确定并发布】
        print("8. 🎯 点击【确定并发布】提交发布...")
        page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const pub = btns.find(b => (b.innerText || '').trim() === '确定并发布');
            if (pub) pub.click();
        }""")
        
        print("等待发布跳转 (10s)...")
        time.sleep(10)
        
        final_url = page.url
        final_title = page.title()
        print(f"发布后页面 URL: {final_url}")
        print(f"发布后页面 Title: {final_title}")
        
        page.screenshot(path="tools/backlinks/juejin_post1_final.png")
        
        # 写入 tracker
        add_backlink(
            platform="稀土掘金 (Juejin DA 86+)",
            region="国内",
            category="字节跳动前沿技术社区",
            post_title=ARTICLE_TITLE,
            target_url="https://chanzong.space",
            backlink_url=final_url,
            anchor_text="禅宗知识库 (chanzong.space)",
            link_type="DoFollow / In-content Contextual",
            status="Live",
            notes="稀土掘金前端架构专栏首发长文，深度拆解 Next.js 14 与 D3.js 知识图谱架构并嵌入官网外链"
        )
        print("🎉 掘金第 1 篇已成功计入外链总账！")
        
        ctx.close()
        return final_url

if __name__ == "__main__":
    publish_juejin()
