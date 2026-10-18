# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

CUR_DIR = os.path.dirname(os.path.abspath(__file__))
PROFILE_DIR = os.path.join(CUR_DIR, ".browser_profile")
REAL_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0"

with open(os.path.join(CUR_DIR, "douban_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

# 访问刚刚发布的《心经》书评
REVIEW_URL = "https://book.douban.com/review/17808304/"

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True,
        user_agent=REAL_UA,
        args=["--disable-blink-features=AutomationControlled"]
    )
    ctx.add_cookies(cookie_list)
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    
    print(f"访问书评详情页: {REVIEW_URL}")
    page.goto(REVIEW_URL, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 查找“修改”链接
    edit_link = page.evaluate("""() => {
        const a = Array.from(document.querySelectorAll('a')).find(el => el.innerText.trim() === '修改' || el.innerText.trim() === '编辑');
        return a ? a.href : null;
    }""")
    print("修改链接:", edit_link)
    
    if edit_link:
        page.goto(edit_link, wait_until="domcontentloaded", timeout=30000)
        time.sleep(3)
        print("编辑页面标题:", page.title())
        print("编辑页面URL:", page.url)
        
        # 探测工具栏上的链接按钮
        toolbar_info = page.evaluate("""() => {
            const buttons = Array.from(document.querySelectorAll('.editor-toolbar button, .editor-toolbar span, [class*="toolbar"] *')).map(b => ({
                tag: b.tagName,
                title: b.title || b.getAttribute('aria-label') || b.className,
                className: b.className
            }));
            return buttons;
        }""")
        print("工具栏按钮探测:", toolbar_info[:15])
        page.screenshot(path="tools/backlinks/douban_edit_toolbar.png")
        
    ctx.close()
