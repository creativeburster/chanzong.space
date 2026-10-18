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

with open(os.path.join(CUR_DIR, "bilibili_cookies.json"), "r", encoding="utf-8") as f:
    cookie_list = json.load(f)

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
    
    # 尝试访问专栏创作编辑器
    editor_url = "https://member.bilibili.com/platform/upload/text/apply"
    print(f"正在访问专栏创作页: {editor_url}")
    page.goto(editor_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    print("页面标题:", page.title())
    print("当前URL:", page.url)
    page.screenshot(path="tools/backlinks/bilibili_article_editor.png")
    
    # 如果跳转或者在编辑页，探测元素
    editor_elements = page.evaluate("""() => {
        const titleInput = document.querySelector('input[placeholder*="标题"], textarea[placeholder*="标题"], .title-input input');
        const contentArea = document.querySelector('.article-holder, [contenteditable="true"], .ProseMirror, .ql-editor');
        const submitBtn = Array.from(document.querySelectorAll('button, .submit-btn, .publish-btn')).map(b => b.innerText.trim());
        return {
            url: window.location.href,
            titleInput: !!titleInput,
            contentArea: !!contentArea,
            buttons: submitBtn
        };
    }""")
    print("专栏编辑器探测:", json.dumps(editor_elements, ensure_ascii=False, indent=2))
    
    # 同时也探测动态发布页
    t_url = "https://t.bilibili.com"
    print(f"正在访问B站动态主页: {t_url}")
    page.goto(t_url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/bilibili_dynamic_home.png")
    
    dynamic_elements = page.evaluate("""() => {
        const textarea = document.querySelector('.bili-dyn-publishing__textarea, textarea[placeholder*="动态"], .editor-area');
        const pubBtn = document.querySelector('.bili-dyn-publishing__action, button:has-text("发布")');
        return {
            hasTextarea: !!textarea,
            hasPubBtn: !!pubBtn
        };
    }""")
    print("动态发布区探测:", dynamic_elements)
    
    ctx.close()
