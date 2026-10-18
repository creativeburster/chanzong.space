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
    
    art_info = page.evaluate("""() => {
        const links = Array.from(document.querySelectorAll('a[href*="/post/"]'));
        return links.map(a => ({ title: a.innerText.trim(), href: a.href }));
    }""")
    print("已发布文章列表:")
    print(json.dumps(art_info, ensure_ascii=False, indent=2))
    
    # 也检查一下作者 UID
    uid_info = page.evaluate("""() => {
        const userA = document.querySelector('a[href*="/user/"]');
        return userA ? userA.href : null;
    }""")
    print("用户主页 URL:", uid_info)
    
    browser.close()
