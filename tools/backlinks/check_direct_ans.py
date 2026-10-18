# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    url = "https://www.zhihu.com/question/2053095292069852633/answer/2080595083485882039"
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    text = page.evaluate("""() => {
        const item = document.querySelector('.RichContent-inner');
        return item ? item.innerText : '';
    }""")
    print("Answer length:", len(text))
    print("Answer tail:\n", text[-800:])
    ctx.close()
