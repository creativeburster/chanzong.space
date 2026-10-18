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
    
    page.goto("https://member.bilibili.com/platform/upload/text/new-article", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    # 点击【＋ 新的创作】
    new_btn = page.query_selector('button:has-text("新的创作"), div:has-text("新的创作")')
    if new_btn:
        print("点击【＋ 新的创作】...")
        new_btn.click()
        time.sleep(4)
        
    print("进入后页面标题:", page.title())
    print("进入后页面URL:", page.url)
    page.screenshot(path="tools/backlinks/bilibili_real_editor.png")
    
    # 探测真正的编辑器元素
    elements = page.evaluate("""() => {
        const titleInput = document.querySelector('input[placeholder*="标题"], textarea[placeholder*="标题"], .article-title input');
        const contentEditable = document.querySelector('[contenteditable="true"], .ProseMirror, .ql-editor, .notranslate');
        const buttons = Array.from(document.querySelectorAll('button, .btn')).map(b => b.innerText.trim()).filter(Boolean);
        return {
            titleInput: titleInput ? { placeholder: titleInput.placeholder, tag: titleInput.tagName } : null,
            contentEditable: contentEditable ? { className: contentEditable.className, tag: contentEditable.tagName } : null,
            buttons: buttons.slice(0, 10)
        };
    }""")
    print("编辑器元素信息:", json.dumps(elements, ensure_ascii=False, indent=2))
    
    ctx.close()
