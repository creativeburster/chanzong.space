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

ARTIFACT_DIR = r"C:\Users\willp\.gemini\antigravity\brain\8a69131c-a802-4486-b158-e51e2148c1a5"

def test_juejin_editor():
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
        title = "开源数字人文实践：基于 Next.js 14 与 D3.js 构建多维禅宗知识图谱"
        print(f"2. 填写标题: {title}...")
        page.locator('input.title-input').fill(title)
        time.sleep(1)
        
        # 探测 CodeMirror 编辑器实际可编辑节点
        print("3. 定位并聚焦编辑器...")
        editor_node = page.locator('.cm-content, [contenteditable="true"], .CodeMirror-scroll').first
        editor_node.click()
        time.sleep(0.5)
        
        # 注入 Markdown 正文
        print("4. 注入 Markdown 正文...")
        sample_md = """# 开源数字人文实践：基于 Next.js 14 与 D3.js 构建 120+ 部禅宗典籍多维知识图谱

在数字化人文（Digital Humanities）的蓬勃发展下，传统典籍的整理与研究正在从单一的纸质文本、扁平检索向结构化拓扑网络演进。

禅宗作为中国思想史与世界哲学的重要脉络，其经典浩瀚、法脉延绵、公案机锋极具网状互文性。我们基于现代化 Web 技术栈，构建并开源了 **[禅宗知识库 (chanzong.space)](https://chanzong.space)**。

## 一、 技术架构设计
- **核心框架**：Next.js 14 (App Router) + React 18 + TypeScript
- **样式系统**：Tailwind CSS，参考极简宣纸禅意美学
- **动态图谱**：基于 D3.js v7 物理引力仿真网络，支持多层级节点高亮、知识碰撞与拓扑穿梭

欢迎同修与开发者体验并交流：
🌐 演示站点：[https://chanzong.space](https://chanzong.space)
"""
        # 使用 insert_text 保证格式不乱
        for line in sample_md.split("\n"):
            page.keyboard.insert_text(line)
            page.keyboard.press("Enter")
            time.sleep(0.01)
            
        time.sleep(2)
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "juejin_markdown_rendered.png"))
        print("已截图渲染效果: juejin_markdown_rendered.png")
        
        # 点击右上角【发布】按钮
        print("5. 点击右上角【发布】按钮...")
        page.locator('button:has-text("发布")').first.click()
        time.sleep(3)
        
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "juejin_publish_drawer.png"))
        print("已截图发布抽屉: juejin_publish_drawer.png")
        
        # 探测抽屉里的分类选择
        drawer_detail = page.evaluate("""() => {
            const categories = Array.from(document.querySelectorAll('.category-list .item, [class*="category"] li, [class*="item"]')).map(el => el.innerText.trim()).filter(t => t.length > 0);
            const tagInput = document.querySelector('.tag-input, input[placeholder*="标签"]');
            const submitBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('确定并发布') || (b.innerText || '').includes('确认并发布'));
            return {
                categories: categories.slice(0, 15),
                hasTagInput: !!tagInput,
                submitBtnText: submitBtn ? submitBtn.innerText.trim() : null
            };
        }""")
        print("发布抽屉详情:", json.dumps(drawer_detail, ensure_ascii=False, indent=2))
        
        ctx.close()

if __name__ == "__main__":
    test_juejin_editor()
