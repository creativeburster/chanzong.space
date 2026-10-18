# -*- coding: utf-8 -*-
import json
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

COOKIE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".browser_profile", "zhihu_cookie.json")
with open(COOKIE_PATH, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
cookies = [{"name": k, "value": v.strip('"'), "domain": ".zhihu.com", "path": "/"} for k, v in cookie_dict.items()]

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0",
        locale="zh-CN"
    )
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://www.zhihu.com/people/duliuxiang/answers", wait_until="domcontentloaded", timeout=30000)
    time.sleep(4)
    
    answers = page.evaluate("""() => {
        const list = [];
        const items = document.querySelectorAll('.List-item, .ContentItem');
        for (const item of items) {
            const titleEl = item.querySelector('h2 a, .ContentItem-title a');
            if (titleEl) {
                list.push({
                    title: titleEl.innerText.trim(),
                    href: titleEl.href
                });
            }
        }
        return list;
    }""")
    print(f"当前账号已发布回答数: {len(answers)}")
    for idx, a in enumerate(answers):
        print(f"[{idx+1}] {a['title']} -> {a['href']}")
    browser.close()
