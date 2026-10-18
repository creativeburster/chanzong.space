# -*- coding: utf-8 -*-
import json
import time
import os
from playwright.sync_api import sync_playwright

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
from tracker import add_backlink

with open('tools/backlinks/.browser_profile/juejin_cookie.json', 'r', encoding='utf-8') as f:
    cookies = json.load(f)

TITLE = "从两千年古籍文献到动态引力网络：数字人文领域的知识图谱建模实战"
CONTENT = """# 从两千年古籍文献到动态引力网络：数字人文领域的知识图谱建模实战

古籍文献的数字化绝不仅是将纸质书转换为扫描 PDF 或 OCR 纯文本，如何利用现代数据结构赋能人文思想的深度互联，是数字人文（Digital Humanities）的核心命题。

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

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    print("1. 打开新建文章...")
    page.goto('https://juejin.cn/editor/drafts/new', wait_until='domcontentloaded')
    time.sleep(3)
    
    print("2. 填入标题...")
    page.locator('input.title-input').fill(TITLE)
    time.sleep(1)
    
    print("3. 聚焦编辑区并打入 Markdown 正文...")
    page.mouse.click(200, 250)
    time.sleep(0.5)
    for line in CONTENT.split("\n"):
        page.keyboard.insert_text(line)
        page.keyboard.press("Enter")
        time.sleep(0.01)
    time.sleep(2)
    
    print("4. 点击右上角【发布】...")
    page.evaluate("""() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '发布');
        if (btn) btn.click();
    }""")
    time.sleep(2.5)
    
    print("5. 选分类【前端】...")
    page.evaluate("""() => {
        const items = Array.from(document.querySelectorAll('.category-list .item, [class*="category"] li, [class*="item"]'));
        const fe = items.find(el => (el.innerText || '').trim() === '前端');
        if (fe) fe.click();
    }""")
    time.sleep(1.5)
    
    print("6. 点击标签占位框 (730, 318)...")
    page.mouse.click(730, 318)
    time.sleep(1.5)
    
    print("7. 在下拉列表点击【前端】标签...")
    clicked_tag = page.evaluate("""() => {
        const options = Array.from(document.querySelectorAll('.byte-select-option, [class*="option"], [class*="dropdown"] li, [class*="dropdown"] span'));
        const tag = options.find(el => (el.innerText || '').trim() === '前端');
        if (tag) {
            tag.click();
            return { clicked: true, text: tag.innerText };
        }
        return { clicked: false, total: options.length };
    }""")
    print("标签点击结果:", clicked_tag)
    time.sleep(1.5)
    
    # 点击空白处或抽屉标题收起下拉框
    page.mouse.click(600, 150)
    time.sleep(1)
    
    page.screenshot(path='tools/backlinks/post2_ready_to_pub.png')
    
    print("8. 🎯 点击【确定并发布】...")
    page.evaluate("""() => {
        const pub = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '确定并发布');
        if (pub) pub.click();
    }""")
    time.sleep(8)
    
    page.screenshot(path='tools/backlinks/post2_after_pub.png')
    print("发布后页面 URL:", page.url)
    print("发布后页面 Title:", page.title())
    
    # 访问文章列表获取真实 post URL
    page.goto('https://juejin.cn/creator/content/article/essays', timeout=30000)
    time.sleep(3)
    post2_url = page.evaluate("""(t) => {
        const links = Array.from(document.querySelectorAll('a[href*="/post/"]'));
        for (const a of links) {
            if (a.innerText.includes('古籍文献') || a.innerText.includes(t.slice(0, 8))) {
                return a.href;
            }
        }
        return links.length > 0 ? links[0].href : null;
    }""", TITLE)
    
    print("🎉 第 2 篇正式公开 URL:", post2_url)
    
    if post2_url and post2_url != "https://juejin.cn/post/7683129449793601536":
        add_backlink(
            platform="稀土掘金 (Juejin DA 86+)",
            region="国内",
            category="字节跳动前沿技术社区",
            post_title=TITLE,
            target_url="https://chanzong.space",
            backlink_url=post2_url,
            anchor_text="禅宗知识库 (chanzong.space)",
            link_type="DoFollow / In-content Contextual",
            status="Live",
            notes="稀土掘金前端架构专栏技术深度剖析第 2 篇，拆解两千年古籍结构化图谱拓扑与双向互联"
        )
        print("✅ 第 2 篇已确认录入总账！")
    else:
        print("注意：URL 需要检查")
        
    browser.close()
