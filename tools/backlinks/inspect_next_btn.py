# -*- coding: utf-8 -*-
import os, sys, time, json
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

with open("tools/backlinks/douban_cookies.json", "r", encoding="utf-8") as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto("https://book.douban.com/subject/5214628/new_review", wait_until="domcontentloaded")
    time.sleep(2)
    els = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('*'))
            .filter(el => el.innerText && el.innerText.trim() === '下一步')
            .map(el => ({
                tag: el.tagName,
                class: el.className,
                html: el.outerHTML.slice(0, 150)
            }));
    }""")
    print("找到包含'下一步'的元素:", json.dumps(els, ensure_ascii=False, indent=2))
    browser.close()
