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

PROFILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile")

with sync_playwright() as p:
    ctx = p.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="msedge",
        headless=True
    )
    page = ctx.pages[0] if ctx.pages else ctx.new_page()
    page.goto("https://www.zhihu.com/creator/manage/creation/all", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    print("Creator page URL:", page.url)
    print("Creator page Title:", page.title())
    page.screenshot(path="tools/backlinks/zhihu_creator_manage.png")
    
    # 提取文章列表
    items = page.evaluate("""() => {
        const rows = [];
        const links = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/question/"]'));
        for (const l of links) {
            rows.push({
                text: l.innerText.trim(),
                href: l.href
            });
        }
        return rows;
    }""")
    print("Found items in creator center:", json.dumps(items[:10], ensure_ascii=False, indent=2))
    ctx.close()
