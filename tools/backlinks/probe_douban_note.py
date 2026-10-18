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
COOKIE_FILE = os.path.join(CUR_DIR, "douban_cookies.json")

def probe_note_create():
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
        
        print("访问豆瓣新建日记页面: https://www.douban.com/note/create")
        page.goto("https://www.douban.com/note/create", timeout=30000)
        time.sleep(3)
        
        print(f"当前页面标题: {page.title()}, URL: {page.url}")
        page.screenshot(path=os.path.join(CUR_DIR, "douban_note_create_probe.png"))
        
        # 检查标题输入框与正文编辑器
        title_box = page.query_selector('input#note_title, input[name="note_title"], input')
        print(f"检测到标题输入框: {bool(title_box)}")
        
        editor = page.query_selector('#note_text, textarea, div[contenteditable="true"]')
        print(f"检测到内容编辑器: {bool(editor)}")
        
        browser.close()

if __name__ == "__main__":
    probe_note_create()
