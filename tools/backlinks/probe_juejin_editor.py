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

def probe_juejin():
    with open("tools/backlinks/.browser_profile/juejin_cookie.json", "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        ctx = create_stealth_context(p, headless=True)
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        page.set_viewport_size({"width": 1440, "height": 900})
        
        print("1. 打开掘金编辑器...")
        page.goto("https://juejin.cn/editor/drafts/new", timeout=35000, wait_until="domcontentloaded")
        time.sleep(3)
        
        # 探测标题与编辑器选择器
        dom_info = page.evaluate("""() => {
            const titleInput = document.querySelector('input.title-input, input[placeholder*="输入文章标题"]');
            const editorEl = document.querySelector('.bytemd-editor textarea, .CodeMirror textarea, textarea, [contenteditable="true"]');
            const pubBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').trim() === '发布');
            return {
                titleSelector: titleInput ? titleInput.className : null,
                editorTag: editorEl ? editorEl.tagName : null,
                editorClass: editorEl ? editorEl.className : null,
                hasPubBtn: !!pubBtn
            };
        }""")
        print("掘金 DOM 探测:", json.dumps(dom_info, ensure_ascii=False, indent=2))
        
        # 填入测试标题与内容
        print("2. 尝试填入标题与正文...")
        page.locator('input[placeholder*="输入文章标题"]').fill("基于 Next.js 14 与 D3.js 构建开源数字人文知识图谱实践")
        time.sleep(1)
        
        # 填入正文
        editor_area = page.locator('.bytemd-editor textarea, textarea').first
        editor_area.click()
        editor_area.fill("# 开源数字人文实践：基于 Next.js 14 与 D3.js 构建 120+ 部禅宗典籍多维知识图谱\n\n项目演示官网：[禅宗知识库 (chanzong.space)](https://chanzong.space)\n\n这是一个测试正文。")
        time.sleep(1)
        
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "juejin_filled_test.png"))
        print("表单已填充，已截图 juejin_filled_test.png")
        
        # 点击右上角【发布】按钮，观察弹窗/抽屉
        print("3. 点击右上角【发布】按钮...")
        page.locator('button:has-text("发布")').first.click()
        time.sleep(2)
        
        page.screenshot(path=os.path.join(ARTIFACT_DIR, "juejin_drawer_test.png"))
        print("发布弹窗已截图: juejin_drawer_test.png")
        
        # 探测分类与标签
        panel_info = page.evaluate("""() => {
            const categories = Array.from(document.querySelectorAll('.category-list .item, [class*="category"] li, [class*="category"] span')).map(el => el.innerText.trim()).filter(t => t.length > 0);
            const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('确定并发布') || (b.innerText || '').includes('确认并发布'));
            return {
                categories: categories.slice(0, 10),
                hasConfirmBtn: !!confirmBtn,
                confirmBtnText: confirmBtn ? confirmBtn.innerText.trim() : null
            };
        }""")
        print("抽屉面板信息:", json.dumps(panel_info, ensure_ascii=False, indent=2))
        
        ctx.close()

if __name__ == "__main__":
    probe_juejin()
