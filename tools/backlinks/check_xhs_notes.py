# -*- coding: utf-8 -*-
import json
import time
from playwright.sync_api import sync_playwright

with open('tools/backlinks/.browser_profile/xhs_cookie.json', 'r', encoding='utf-8') as f:
    cd = json.load(f)
cookies = []
for k, v in cd.items():
    cookies.append({"name": k, "value": v.strip('"'), "domain": ".xiaohongshu.com", "path": "/"})
    cookies.append({"name": k, "value": v.strip('"'), "domain": "creator.xiaohongshu.com", "path": "/"})

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True, args=["--disable-blink-features=AutomationControlled"])
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0")
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    
    # 访问笔记管理列表
    page.goto("https://creator.xiaohongshu.com/creator/notes", wait_until="domcontentloaded")
    time.sleep(4)
    page.screenshot(path="tools/backlinks/xhs_notes_list.png")
    
    notes = page.evaluate("""() => {
        const rows = Array.from(document.querySelectorAll('.note-item, .table-row, div[class*="note"]'));
        return rows.map(r => r.innerText).slice(0, 5);
    }""")
    print("NOTES LIST:", json.dumps(notes, ensure_ascii=False))
    browser.close()
