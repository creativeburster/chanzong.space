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
    time.sleep(4)
    page.screenshot(path='tools/backlinks/juejin_creator_articles.png')
    
    articles = page.evaluate("""() => {
        const list = [];
        const links = Array.from(document.querySelectorAll('a')).filter(a => (a.href || '').includes('/post/'));
        for (const a of links) {
            list.push({
                title: a.innerText.trim(),
                url: a.href
            });
        }
        return list;
    }""")
    print("创作者中心公开文章:")
    print(json.dumps(articles, ensure_ascii=False, indent=2))
    
    # 获取页面文本看看是否有“审核中”或已发布
    summary = page.evaluate("""() => {
        const items = Array.from(document.querySelectorAll('.article-item, .entry-item, [class*="article-item"]')).map(el => el.innerText.replace(/\\n/g, ' '));
        return items;
    }""")
    print("文章摘要列表:", json.dumps(summary[:5], ensure_ascii=False, indent=2))
    
    browser.close()
