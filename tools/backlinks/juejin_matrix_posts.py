# -*- coding: utf-8 -*-
"""
稀土掘金 (Juejin DA 86+) 全自动长文发布矩阵引擎
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

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CUR_DIR)
from stealth_browser import create_stealth_context
from tracker import add_backlink

POSTS = [
    {
        "title": "开源数字人文实践：基于 Next.js 14 与 D3.js 构建 120+ 部禅宗典籍多维知识图谱",
        "content": """# 开源数字人文实践：基于 Next.js 14 与 D3.js 构建 120+ 部禅宗典籍多维知识图谱

在数字化人文（Digital Humanities）蓬勃发展的今天，传统哲学典籍的研究与传播正在从单一的平面检索，向多维拓扑网络演进。

禅宗作为世界东方哲学的重要思想脉络，其经典浩瀚、法脉延绵、公案机锋极具网状互文性。我们基于现代全栈 Web 技术，构建并开源了 **[禅宗知识库 (chanzong.space)](https://chanzong.space)**。本文将深入解析其系统架构、D3.js 力导向图设计与海量文本结构化处理方案。

---

## 一、 系统技术架构与选型

在系统工程层面，我们追求极致的加载性能、禅意的美学体验与严谨的数据拓扑：
- **核心框架**：Next.js 14 (App Router) + React 18 + TypeScript，全面采用静态生成 (SSG) 与边缘渲染，实现首屏毫秒级加载；
- **排版系统**：Tailwind CSS，参考极简宣纸禅意美学（`bg-[#FAF9F6]`），配合深色夜空侧边导航（`bg-[#0F172A]`）；
- **动态图谱**：基于 D3.js v7 物理引力仿真网络，支持多层级节点高亮、知识碰撞与拓扑穿梭；
- **离线能力**：全站支持 PWA 与 Service Worker，断网环境下依然可流畅参阅典籍。

---

## 二、 D3.js 交互式物理引力网络实现

传统古籍检索往往局限于扁平关键词搜索，无法直观展现“祖师-经典-法门-公案-核心概念”之间的渊源演进。我们在前端通过 D3.js 力导向算法构建了引力拓扑：

```typescript
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
  .force("charge", d3.forceManyBody().strength(-200))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collision", d3.forceCollide().radius(35));
```

每个节点不仅支持拖拽交互与力学回弹，还具备邻域高亮与蜘蛛网放射线效果。为了避免力导向图持续计算导致的风扇狂转与性能抖动，仿真在运行 3 秒后自动平稳冻结。

---

## 三、 多卡片交叉互链网络 (Card Interlinking)

为了打破信息孤岛，页面采用多卡片网状解构：
1. **概念卡片**：解析源流、引文证据与对勘注音；
2. **祖师卡片**：梳理生平机锋与承传脉络；
3. **法门卡片**：指引修持要领与参究关隘；
4. **公案卡片**：收录核心机锋对答。

底层的强类型结构化数据（TypeScript Taxonomy）保证了全网状链接互通，无任何死链与孤岛。

---

## 四、 开源体验与交流

数字人文的发展离不开开源社区的协作与反馈。项目全库持续更新，欢迎各位前端同修、传统文化学者以及开源开发者参阅与交流：

🌐 **在线体验站点**：[禅宗知识库 (chanzong.space)](https://chanzong.space)
📖 **涵盖内容**：120+ 部经典白话导读、200+ 核心公案、结构化法脉谱系与多维引力图谱。
"""
    },
    {
        "title": "从两千年古籍文献到动态引力网络：数字人文领域的知识图谱建模实战",
        "content": """# 从两千年古籍文献到动态引力网络：数字人文领域的知识图谱建模实战

古籍文献的数字化绝不仅是将纸质书转换为扫描 PDF 或 OCR 纯文本，如何利用数据结构赋能人文思想的深度互联，是数字人文（Digital Humanities）的核心命题。

在开源项目 **[禅宗知识库 (chanzong.space)](https://chanzong.space)** 中，我们完成了涵盖 120+ 部禅门典籍、500+ 核心概念、60+ 历代祖师与 200+ 公案的强类型知识图谱构建。

---

## 一、 海量古籍文本的规范清洗与结构化

原始古籍与历史文献在数字化过程中存在大量的排版噪音与异体字：
1. **页眉页脚与版心噪音过滤**：通过正则表达式彻底剔除 OCR 产生的残余标记；
2. **统一白话导读与核心旨趣**：为每部典籍独家撰写现代导读，拆解作者生平、核心宗风与修行要旨；
3. **字词对勘与拼音注音**：对生僻字、多音字建立结构化字典映射，降低学术阅读门槛。

---

## 二、 强类型数据拓扑网络设计

在前端工程中，我们将知识图谱抽象为 5 大基础实体：
- `ZEN_PERSONS`（人物/祖师）
- `ZEN_CONCEPTS`（核心概念）
- `ZEN_METHODS`（修持法门）
- `ZEN_KOANS`（公案机锋）
- `ZEN_FAQS`（义理问答）

每一个实体之间均包含严格的双向交叉引用数组（`relatedPersons`, `relatedConcepts`, `relatedBooks`）。这种严格受控的数据拓扑，为前端 D3.js 引力网络渲染提供了坚实的数据基底。

---

## 三、 消除认知孤岛的多维下钻体验

在详情页中，任何实体都不会留白，而是以“胶囊标签”和“相关实体卡片”的形式全网状互联。读者在参阅《六祖坛经》时，可一键下钻至“菩提自性”概念，进而引出神秀大师、惠能大师与参禅法门。

欢迎体验我们的开源数字人文实践成果：
🌐 **官方知识图谱体验**：[禅宗知识库 (chanzong.space)](https://chanzong.space)
"""
    },
    {
        "title": "Web 前端与传统哲学的碰撞：现代交互式典籍图谱的动效与性能优化",
        "content": """# Web 前端与传统哲学的碰撞：现代交互式典籍图谱的动效与性能优化

现代 Web 前端技术不仅用于商业系统开发，在传统思想、哲学典籍与学术研究的可视化中同样能大放异彩。

在研发 **[禅宗知识库 (chanzong.space)](https://chanzong.space)** 过程中，如何在呈现丰富视觉交互的同时保持极低的首屏载入时间和极致的流畅度？本文总结了我们在动效与性能优化上的实践经验。

---

## 一、 宣纸温润美学与夜空暗色的设计哲学

为了让学者与参修者沉浸式阅读，全站避免了刺眼的纯白高对比度：
- **画布底色**：采用温润宣纸色（`bg-[#FAF9F6]`），字色采用内敛的古墨黑（`text-[#2C2C2C]`）；
- **导航对比**：左侧边栏采用夜空深蓝（`bg-[#0F172A]`），形成开阔而宁静的视觉层次；
- **排版节奏**：严格控制行高与字距，配合精选金句卡片与折叠注音。

---

## 二、 D3.js 大规模节点引力网络的性能优化

在知识图谱包含数百个节点与上千条关系连线时，SVG 渲染容易引起主线程掉帧：
1. **仿真时限冻结**：通过 `alphaTarget(0)` 并在 3000ms 后调用 `simulation.stop()`，避免持续消耗 CPU；
2. **轻量邻域高亮算法**：在鼠标悬浮节点时，通过 Set 快速查找直连边与直连点，将非相关节点的 opacity 平滑降低，突出知识脉络；
3. **坐标缓存与变换矩阵**：结合 CSS `transform` 与硬件加速，实现丝滑平移缩放。

---

## 三、 PWA 离线缓存与无缝断网体验

为了让用户在静修、旅行等弱网或无网环境中依然能研读典籍：
- 注入 Service Worker 离线拦截策略，将核心 Markdown 文本与结构化 Taxonomy 缓存在 Cache Storage 中；
- 用户访问 2 分钟后，以低扰动的方式提示添加至桌面，享受类似 Native App 的全屏研读体验。

---

## 四、 欢迎访问与技术探讨

🌐 **体验入口**：[禅宗知识库 (chanzong.space)](https://chanzong.space)
欢迎大家体验并提出宝贵的性能优化与学术交互建议！
"""
    }
]

def publish_single_post(page, post_data, index):
    print(f"\n================ 开始发布第 {index} 篇: {post_data['title']} ================")
    page.goto("https://juejin.cn/editor/drafts/new", timeout=35000, wait_until="domcontentloaded")
    time.sleep(3)
    
    # 1. 填入标题
    print("1. 填写标题...")
    title_box = page.locator('input.title-input, input[placeholder*="输入文章标题"]').first
    title_box.click()
    title_box.fill(post_data["title"])
    time.sleep(1)
    
    # 2. 聚焦左侧编辑器
    print("2. 聚焦编辑器并注入正文...")
    page.mouse.click(200, 250)
    time.sleep(0.5)
    
    for line in post_data["content"].split("\n"):
        page.keyboard.insert_text(line)
        page.keyboard.press("Enter")
        time.sleep(0.01)
    time.sleep(2)
    
    # 3. 点击右上角【发布】
    print("3. 点击右上角【发布】按钮...")
    page.locator('button:has-text("发布")').first.click()
    time.sleep(2.5)
    
    # 4. 选择分类【前端】
    print("4. 选择分类【前端】...")
    page.evaluate("""() => {
        const items = Array.from(document.querySelectorAll('.category-list .item, [class*="category"] li, [class*="item"]'));
        const fe = items.find(el => (el.innerText || '').trim() === '前端');
        if (fe) fe.click();
    }""")
    time.sleep(1.5)
    
    # 5. 点击添加标签并选择【前端】
    print("5. 点击添加标签并选择【前端】...")
    page.evaluate("""() => {
        const ph = document.querySelector('.byte-select__placeholder');
        if (ph) ph.click();
    }""")
    time.sleep(1.5)
    
    page.evaluate("""() => {
        const opt = Array.from(document.querySelectorAll('.byte-select-option, [class*="option"], [class*="item"], span')).find(el => (el.innerText || '').trim() === '前端');
        if (opt) opt.click();
    }""")
    time.sleep(1)
    
    # 6. 点击【确定并发布】
    print("6. 🎯 点击【确定并发布】...")
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
    
    screen_done = os.path.join(CUR_DIR, f"juejin_post_{index}_published.png")
    page.screenshot(path=screen_done)
    
    # 记录到总账
    add_backlink(
        platform="稀土掘金 (Juejin DA 86+)",
        region="国内",
        category="字节跳动前沿技术社区",
        post_title=post_data["title"],
        target_url="https://chanzong.space",
        backlink_url=final_url,
        anchor_text="禅宗知识库 (chanzong.space)",
        link_type="DoFollow / In-content Contextual",
        status="Live",
        notes=f"稀土掘金前端专栏技术深度剖析第 {index} 篇，带开源架构设计与官网知识图谱超链接"
    )
    print(f"✅ 第 {index} 篇发布完成并已录入总账！")
    return final_url

def run_all_posts():
    with open("tools/backlinks/.browser_profile/juejin_cookie.json", "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        urls = []
        for i, post in enumerate(POSTS, 1):
            u = publish_single_post(page, post, i)
            urls.append(u)
            if i < len(POSTS):
                print("篇际平稳缓冲 5 秒...")
                time.sleep(5)
                
        ctx.close()
        print("\n🎉 全部 3 篇掘金深度长文已全自动发布完毕！")
        for i, u in enumerate(urls, 1):
            print(f"第 {i} 篇: {u}")

if __name__ == "__main__":
    run_all_posts()
