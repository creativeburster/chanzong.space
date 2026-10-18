# -*- coding: utf-8 -*-
"""
测试豆瓣写日记编辑器 DOM 交互与发布
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
COOKIE_FILE = os.path.join(CUR_DIR, "douban_cookies.json")

def test_note_ui():
    with open(COOKIE_FILE, "r", encoding="utf-8") as f:
        cookies = json.load(f)
        
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="msedge",
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )
        ctx = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
            locale="zh-CN"
        )
        ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        ctx.add_cookies(cookies)
        page = ctx.new_page()
        
        page.goto("https://www.douban.com/note/create", timeout=30000)
        time.sleep(3)
        
        # 寻找标题
        title_input = page.locator('input[placeholder*="标题"], .title-input, input').first
        print("标题输入框:", title_input.is_visible())
        title_input.click()
        title_input.fill("测试禅修日记标题")
        time.sleep(1)
        
        # 寻找正文编辑器
        editor = page.locator('.public-DraftEditor-content, div[contenteditable="true"], .editor-content, textarea').first
        print("正文编辑器:", editor.is_visible())
        editor.click()
        time.sleep(0.5)
        page.keyboard.insert_text("这是一篇关于禅宗心法的研读感悟。\n六祖大师云：本来无一物，何处惹尘埃。\n详见禅宗知识库：https://chanzong.space/classics/tanjing")
        time.sleep(1)
        
        page.screenshot(path=os.path.join(CUR_DIR, "douban_note_typed.png"))
        print("已保存填好内容的截图: douban_note_typed.png")
        
        # 寻找发布按钮
        pub_btn = page.locator('button:has-text("发布"), .btn-publish, .publish-btn').first
        print("发布按钮:", pub_btn.is_visible(), "text:", pub_btn.inner_text().strip())
        
        browser.close()

if __name__ == "__main__":
    test_note_ui()
