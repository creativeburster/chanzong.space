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
    
    posts = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href*="/post/"]')).map(a => ({
            title: a.innerText.trim().replace(/\\n/g, ' '),
            href: a.href
        }));
    }""")
    print("已发布文章链接 (post):")
    print(json.dumps(posts, ensure_ascii=False, indent=2))
    
    # 访问草稿箱
    page.goto('https://juejin.cn/creator/content/article/drafts', timeout=30000)
    time.sleep(3)
    drafts = page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href*="/editor/drafts/"]')).map(a => ({
            title: a.innerText.trim().replace(/\\n/g, ' '),
            href: a.href
        }));
    }""")
    print("草稿箱链接 (drafts):")
    print(json.dumps(drafts, ensure_ascii=False, indent=2))
    
    browser.close()
