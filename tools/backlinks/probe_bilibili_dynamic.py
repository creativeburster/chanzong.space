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
    
    print("访问 B 站动态主页...", flush=True)
    page.goto("https://t.bilibili.com", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    print("动态主页标题:", page.title(), flush=True)
    print("动态主页URL:", page.url, flush=True)
    page.screenshot(path="tools/backlinks/bilibili_dynamic_view.png")
    
    # 查找动态发布框
    dyn_box = page.evaluate("""() => {
        const textarea = document.querySelector('textarea, [contenteditable="true"], .editor-wrap');
        const publishBtns = Array.from(document.querySelectorAll('button, .btn')).map(b => b.innerText.trim()).filter(t => t.includes('发布') || t.includes('发动态'));
        return {
            hasTextarea: !!textarea,
            textareaTag: textarea ? textarea.tagName : null,
            textareaClass: textarea ? textarea.className : null,
            placeholder: textarea ? (textarea.placeholder || textarea.getAttribute('placeholder')) : null,
            publishBtns: publishBtns
        };
    }""")
    print("动态发布框探测:", json.dumps(dyn_box, ensure_ascii=False, indent=2), flush=True)
    
    ctx.close()
