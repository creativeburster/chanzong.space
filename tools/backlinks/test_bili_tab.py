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
    
    btn_details = page.evaluate("""() => {
        const btn = Array.from(document.querySelectorAll('*')).find(el => el.innerText && el.innerText.trim() === '+ 新的创作');
        const parentA = btn ? btn.closest('a') : null;
        return {
            tag: btn ? btn.tagName : null,
            outerHTML: btn ? btn.outerHTML : null,
            parentA: parentA ? parentA.outerHTML : null
        };
    }""")
    print("按钮DOM:", json.dumps(btn_details, ensure_ascii=False, indent=2))
    
    # 监听新打开的页面
    with ctx.expect_page() as new_page_info:
        page.click('text="+ 新的创作"')
    new_page = new_page_info.value
    new_page.wait_for_load_state("domcontentloaded")
    time.sleep(3)
    print("新标签页标题:", new_page.title())
    print("新标签页URL:", new_page.url)
    new_page.screenshot(path="tools/backlinks/bilibili_article_editor_real.png")
    
    editor_dom = new_page.evaluate("""() => {
        const titleInput = document.querySelector('input, textarea, [placeholder*="标题"]');
        const editable = document.querySelector('[contenteditable="true"]');
        return {
            titleTag: titleInput ? titleInput.tagName : null,
            titlePlaceholder: titleInput ? titleInput.placeholder : null,
            editableClass: editable ? editable.className : null
        };
    }""")
    print("真实编辑器结构:", editor_dom)
    
    ctx.close()
