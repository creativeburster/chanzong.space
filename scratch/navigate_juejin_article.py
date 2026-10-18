# -*- coding: utf-8 -*-
import os, sys, json, time
from playwright.sync_api import sync_playwright
sys.path.append("tools/backlinks")
from stealth_browser import create_stealth_context

with sync_playwright() as p:
    ctx = create_stealth_context(p, headless=True)
    with open("tools/backlinks/.browser_profile/juejin_cookie.json", "r", encoding="utf-8") as f:
        ctx.add_cookies(json.load(f))
    page = ctx.new_page()
    page.goto("https://juejin.cn/creator/content/column", timeout=25000)
    time.sleep(3)
    
    # 点击左侧侧边栏的“文章管理”
    article_nav = page.query_selector("div:has-text('文章管理'), a:has-text('文章管理'), span:has-text('文章管理')")
    if article_nav:
        print("点击左侧【文章管理】...")
        article_nav.click()
        time.sleep(3)
        print("当前 URL:", page.url)
        page.screenshot(path="scratch/juejin_real_article_manage.png")
        
        # 查找页面上的所有文章项与链接
        items = page.evaluate("""() => {
            return Array.from(document.querySelectorAll('.article-item, .title-box, a[href*="/post/"], div[class*="article"]')).map(el => ({
                text: el.innerText.trim(),
                href: el.getAttribute('href') || (el.querySelector('a') ? el.querySelector('a').href : null)
            })).filter(x => x.text.length > 5);
        }""")
        print("Article items:", json.dumps(items[:5], ensure_ascii=False, indent=2))
    ctx.close()
