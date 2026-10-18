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
    
    page.goto("https://book.douban.com/review/15226779/", wait_until="domcontentloaded", timeout=30000)
    time.sleep(2)
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    time.sleep(1)
    
    btn_info = page.evaluate("""() => {
        const textarea = document.querySelector('textarea[name="comment-app-textarea"]');
        const form = textarea ? textarea.closest('form') || textarea.parentElement : null;
        const allBtns = Array.from(document.querySelectorAll('input[type="submit"], button, .btn, .submit')).map(b => ({
            tag: b.tagName,
            type: b.type,
            value: b.value,
            text: b.innerText,
            outerHTML: b.outerHTML
        }));
        return {
            formHTML: form ? form.outerHTML.slice(0, 300) : null,
            allBtns: allBtns
        };
    }""")
    print("按钮信息:", json.dumps(btn_info, ensure_ascii=False, indent=2))
    ctx.close()
