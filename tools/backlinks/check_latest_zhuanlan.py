# -*- coding: utf-8 -*-
import os, time, json
from playwright.sync_api import sync_playwright

profile_dir = "tools/backlinks/.browser_profile"
with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://www.zhihu.com/creator/manage/creation/all", wait_until="domcontentloaded", timeout=30000)
    time.sleep(3)
    page.screenshot(path="tools/backlinks/zhihu_creation_latest_check.png")
    posts = page.evaluate("""() => {
        const as = Array.from(document.querySelectorAll('a[href*="/p/"]'));
        return as.slice(0, 5).map(a => ({ title: a.innerText.trim(), href: a.href }));
    }""")
    print("Recent posts:", json.dumps(posts, ensure_ascii=False, indent=2))
    ctx.close()
