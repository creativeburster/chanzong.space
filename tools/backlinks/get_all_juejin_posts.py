# -*- coding: utf-8 -*-
import json
import time
from playwright.sync_api import sync_playwright

with open('tools/backlinks/.browser_profile/juejin_cookie.json', 'r', encoding='utf-8') as f:
    cookies = json.load(f)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context()
    ctx.add_cookies(cookies)
    page = ctx.new_page()
    page.goto('https://juejin.cn/creator/content/article/essays', timeout=30000)
    time.sleep(3)
    
    # 打印文章列表所有项
    items = page.evaluate("""() => {
        const list = [];
        const rows = document.querySelectorAll('.article-item, [class*="article-item"]');
        for (const r of rows) {
            const a = r.querySelector('a[href*="/post/"]') || r.querySelector('a');
            const status = r.querySelector('.status, [class*="status"]');
            if (a) {
                list.push({
                    title: a.innerText.trim(),
                    href: a.href,
                    status: status ? status.innerText.trim() : ''
                });
            }
        }
        return list;
    }""")
    print("文章列表全量条目:")
    print(json.dumps(items, ensure_ascii=False, indent=2))
    
    # 检查草稿箱
    page.goto('https://juejin.cn/creator/content/article/drafts', timeout=30000)
    time.sleep(2)
    drafts = page.evaluate("""() => {
        const list = [];
        const rows = document.querySelectorAll('.draft-item, [class*="draft-item"]');
        for (const r of rows) {
            const a = r.querySelector('a');
            if (a) list.push({ title: a.innerText.trim(), href: a.href });
        }
        return list;
    }""")
    print("草稿箱条目:")
    print(json.dumps(drafts, ensure_ascii=False, indent=2))
    
    browser.close()
