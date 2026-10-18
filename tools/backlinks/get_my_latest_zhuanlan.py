# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
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
    page.goto("https://www.zhihu.com/people/duliuxiang/posts", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    
    posts = page.evaluate("""() => {
        const results = [];
        const items = document.querySelectorAll('.List-item, .ContentItem');
        for (const item of items) {
            const titleEl = item.querySelector('h2 a, .ContentItem-title a, a[href*="/p/"]');
            if (titleEl) {
                results.push({
                    title: titleEl.innerText.trim(),
                    href: titleEl.href
                });
            }
        }
        return results;
    }""")
    print("My Latest Posts on Zhihu:")
    for idx, post in enumerate(posts[:5]):
        print(f"[{idx+1}] {post['title']} -> {post['href']}")
        
    ctx.close()
